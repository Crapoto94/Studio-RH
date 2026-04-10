import cron, { ScheduledTask } from 'node-cron'
import { prisma, prismaLocal } from './db'

class CronManager {
  private tasks: Map<number, ScheduledTask> = new Map()

  constructor() {
    console.log('[CRON] Initializing CronManager singleton...')
  }

  // Expression helper
  private getCronExpression(job: any): string {
    if (job.schedule_type === 'custom') return job.schedule
    if (job.schedule_type === 'hourly') return '0 * * * *'
    if (job.schedule_type === 'daily') {
      // Ex: "02:00" -> "0 2 * * *"
      const [hour, minute] = job.schedule.split(':')
      return `${minute || '0'} ${hour || '0'} * * *`
    }
    if (job.schedule_type === 'every_x_hours') {
       return `0 */${job.schedule} * * *`
    }
    return job.schedule
  }

  // The actual function that will be executed
  private async executeJob(jobId: number, type: string) {
    console.log(`[CRON] Executing job ${jobId} of type ${type}`)
    
    // Update last_run in DB
    await prismaLocal.cronJob.update({
      where: { id: jobId },
      data: { last_run: new Date() }
    })

    // Log début d'exécution pour traçabilité (permet de voir que le cron a bien démarré)
    await prisma.synchroLog.create({
      data: {
        type: type as any,
        statut: 'info',
        message: `Déclenchement automatique tâche #${jobId} (${type})`,
        progress: 0
      }
    }).catch(e => console.error("[CRON] Failed to write start log", e))

    try {
        // Pour les appels internes, on préfère localhost pour éviter les problèmes de loopback/firewall sur l'IP publique
        const port = process.env.PORT || '3000'
        const internalUrl = `http://localhost:${port}`
        
        let endpoint = ''
        switch(type) {
            case 'rh': endpoint = '/api/synchro/rh'; break;
            case 'ad': endpoint = '/api/synchro/ad'; break;
            case 'azure': endpoint = '/api/synchro/azure'; break;
            case 'mairie': endpoint = '/api/synchro/brut'; break;
            default:
               console.warn(`[CRON] Unknown sync type: ${type}`)
               return
        }

        const headers: Record<string, string> = {}
        if (process.env.CRON_SECRET) {
            headers['Authorization'] = `Bearer ${process.env.CRON_SECRET}`
        }

        console.log(`[CRON] Internal fetch: ${internalUrl}${endpoint}`)
        const res = await fetch(`${internalUrl}${endpoint}`, { 
            method: 'POST',
            headers
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error(`[CRON] Job ${jobId} failed with status ${res.status}:`, errorText.substring(0, 500))
            await prisma.synchroLog.create({
                data: {
                    type: type as any,
                    statut: 'error',
                    message: `Échec automatique [${res.status}] : ${errorText.substring(0, 100)}`,
                    progress: 100
                }
            })
            return
        }

        const rawBody = await res.text()
        let data: any
        try {
            data = JSON.parse(rawBody)
        } catch (jsonErr) {
            console.error(`[CRON] Failed to parse JSON response from ${endpoint}. Body starts with: ${rawBody.substring(0, 100)}`)
            throw new Error(`Réponse non-JSON reçue (HTML probable)`)
        }
        console.log(`[CRON] Job ${jobId} finished with status: ${res.status}`, data)
    } catch (e) {
        console.error(`[CRON] Job ${jobId} failed:`, e)
        // Log d'erreur réseau / crash direct
        await prisma.synchroLog.create({
            data: {
                type: type as any,
                statut: 'error',
                message: `Erreur critique automate : ${(e as Error).message}`,
                progress: 100
            }
        })
    }
  }

  // Load and start all active jobs from DB
  public async loadJobs() {
    console.log('[CRON] Loading active jobs from database...')
    
    // Stop any existing
    this.tasks.forEach(task => task.stop())
    this.tasks.clear()

    try {
        const jobs = await prismaLocal.cronJob.findMany({
            where: { is_active: true }
        })

        for (const job of jobs) {
            const expression = this.getCronExpression(job)
            console.log(`[CRON] Scheduling job [${job.id}] ${job.name} with expression: ${expression}`)
            
            const task = cron.schedule(expression, () => {
                this.executeJob(job.id, job.type)
            })
            
            this.tasks.set(job.id, task)
        }
    } catch (e) {
        console.error('[CRON] Failed to load jobs:', e)
    }
  }

  public reload() {
      console.log('[CRON] Reload requested')
      this.loadJobs()
  }
}

// Global instance to prevent memory leaks in dev mode
const globalForCron = globalThis as unknown as {
  cronManager: CronManager | undefined
}

export const cronManager = globalForCron.cronManager ?? new CronManager()

if (process.env.NODE_ENV !== 'production') globalForCron.cronManager = cronManager

