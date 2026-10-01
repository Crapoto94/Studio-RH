import cron, { ScheduledTask } from 'node-cron'
import { prisma, prismaLocal } from './db'
import { runRhSync, runAdSync, runAzureSync, runBrutSync } from './sync'
import { runOnboardingCleanup } from './onboarding'

interface QueueItem {
  jobId: number
  type: string
  name: string
}

class CronManager {
  private tasks: Map<number, ScheduledTask> = new Map()
  private jobQueue: QueueItem[] = []
  private isProcessing = false
  private jobOrder: Map<number, number> = new Map()

  constructor() {
    console.log('[CRON] Initializing CronManager singleton...')
  }

  private getCronExpression(job: any): string {
    if (job.schedule_type === 'custom') return job.schedule
    if (job.schedule_type === 'hourly') return '0 * * * *'
    if (job.schedule_type === 'daily') {
      const [hour, minute] = job.schedule.split(':')
      return `${minute || '0'} ${hour || '0'} * * *`
    }
    if (job.schedule_type === 'every_x_hours') {
      return `0 */${job.schedule} * * *`
    }
    return job.schedule
  }

  private async enqueueJob(jobId: number, type: string, name: string) {
    console.log(`[CRON] Enqueuing job ${jobId} "${name}" (${type})`)

    // Un declenchement remplace le run deja en attente pour ce job : sans ca,
    // une longue periode d'arret (BD indisponible) ferait repeter des centaines
    // de fois la meme synchro au redemarrage.
    const pending = this.jobQueue.findIndex(item => item.jobId === jobId)
    if (pending !== -1) this.jobQueue.splice(pending, 1)

    this.jobQueue.push({ jobId, type, name })
    if (!this.isProcessing) {
      await this.processQueue()
    }
  }

  private async processQueue() {
    if (this.isProcessing || this.jobQueue.length === 0) return
    this.isProcessing = true

    try {
      while (this.jobQueue.length > 0) {
        // Tri a chaque tour : les jobs enqueues pendant l'execution d'un autre
        // job doivent eux aussi respecter l'ordre d'affichage du /crons.
        this.jobQueue.sort((a, b) => {
          const aOrder = this.jobOrder.get(a.jobId) ?? 0
          const bOrder = this.jobOrder.get(b.jobId) ?? 0
          return aOrder - bOrder
        })

        const item = this.jobQueue.shift()!

        // Isolation par job : un job en erreur ne doit pas stopper les suivants.
        try {
          await this.executeJob(item.jobId, item.type)
        } catch (e) {
          console.error(`[CRON] Job ${item.jobId} (${item.type}) a interrompu la file:`, e)
        }
      }
    } finally {
      // Le verrou doit imperativement etre relache, y compris en cas d'exception :
      // s'il reste a true, plus aucun job ne sera jamais execute.
      this.isProcessing = false
    }
  }

  private async executeJob(jobId: number, type: string) {
    console.log(`[CRON] Executing job ${jobId} of type ${type}`)

    // last_run reflete le dernier essai, pas le dernier succes.
    try {
      await prismaLocal.cronJob.update({
        where: { id: jobId },
        data: { last_run: new Date() }
      })
    } catch (e) {
      console.error(`[CRON] Impossible de mettre a jour last_run du job ${jobId}:`, e)
    }

    try {
      let result
      switch (type) {
        case 'rh':
          result = await runRhSync()
          break
        case 'ad':
          result = await runAdSync()
          break
        case 'azure':
          result = await runAzureSync()
          break
        case 'brut':
        case 'mairie':
          result = await runBrutSync()
          break
        case 'onboarding_cleanup':
          result = await runOnboardingCleanup()
          break
        default:
          console.warn(`[CRON] Unknown sync type: ${type}`)
          return
      }

      console.log(`[CRON] Job ${jobId} (${type}) finished:`, result.message)
    } catch (e) {
      console.error(`[CRON] Job ${jobId} (${type}) failed:`, e)

      // L'ecriture du log ne doit jamais relancer depuis le catch : c'est
      // precisement ce second echec qui bloquait la file d'attente pour toujours.
      try {
        await prisma.synchroLog.create({
          data: {
            type: type as any,
            statut: 'error',
            message: `Erreur critique automate : ${(e as Error).message}`,
            progress: 100
          }
        })
      } catch (logError) {
        console.error(`[CRON] Impossible d'ecrire le log d'erreur du job ${jobId}:`, logError)
      }
    }
  }

  public async loadJobs() {
    console.log('[CRON] Loading active jobs from database...')

    this.tasks.forEach(task => task.stop())
    this.tasks.clear()
    this.jobOrder.clear()

    try {
      let jobs: any[]
      try {
        jobs = await prismaLocal.$queryRawUnsafe(
          `SELECT id, name, type, schedule, schedule_type, sort_order, is_active, last_run, next_run, created_at, updated_at
           FROM "CRON_JOBS" WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC`
        )
      } catch {
        jobs = await prismaLocal.$queryRawUnsafe(
          `SELECT id, name, type, schedule, schedule_type, 0 AS sort_order, is_active, last_run, next_run, created_at, updated_at
           FROM "CRON_JOBS" WHERE is_active = 1 ORDER BY created_at DESC`
        )
      }

      jobs.forEach((job: any, index: number) => {
        this.jobOrder.set(job.id, index)
      })

      for (const job of jobs) {
        const expression = this.getCronExpression(job)
        console.log(`[CRON] Scheduling job [${job.id}] ${job.name} with expression: ${expression}`)

        const task = cron.schedule(expression, () => {
          this.enqueueJob(job.id, job.type, job.name)
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

const globalForCron = globalThis as unknown as {
  cronManager: CronManager | undefined
}

export const cronManager = globalForCron.cronManager ?? new CronManager()

if (process.env.NODE_ENV !== 'production') globalForCron.cronManager = cronManager
