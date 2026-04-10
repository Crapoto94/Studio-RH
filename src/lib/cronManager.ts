import cron, { ScheduledTask } from 'node-cron'
import { prisma } from './db'

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
    await prisma.cronJob.update({
      where: { id: jobId },
      data: { last_run: new Date() }
    })

    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        
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

        const res = await fetch(`${baseUrl}${endpoint}`, { 
            method: 'POST',
            headers
        })

        if (!res.ok) {
            // Si l'appel API renvoie un code d'erreur (ex: 401, 500), on logge l'erreur dans la table de synchro
            const errorText = await res.text()
            await prisma.synchroLog.create({
                data: {
                    type: type as any,
                    statut: 'error',
                    message: `Échec automatique [${res.status}] : ${errorText.substring(0, 100)}`,
                    progress: 100
                }
            })
        }

        const data = await res.json()
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
        const jobs = await prisma.cronJob.findMany({
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

