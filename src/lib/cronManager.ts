import cron, { ScheduledTask } from 'node-cron'
import { prisma, prismaLocal } from './db'
import { runRhSync, runAdSync, runAzureSync, runBrutSync } from './sync'

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
    this.jobQueue.push({ jobId, type, name })
    if (!this.isProcessing) {
      await this.processQueue()
    }
  }

  private async processQueue() {
    if (this.isProcessing || this.jobQueue.length === 0) return
    this.isProcessing = true

    // Sort queue by display order (newest created_at first, matching the scheduler UI)
    this.jobQueue.sort((a, b) => {
      const aOrder = this.jobOrder.get(a.jobId) ?? 0
      const bOrder = this.jobOrder.get(b.jobId) ?? 0
      return aOrder - bOrder
    })

    while (this.jobQueue.length > 0) {
      const item = this.jobQueue.shift()!
      await this.executeJob(item.jobId, item.type)
    }

    this.isProcessing = false
  }

  private async executeJob(jobId: number, type: string) {
    console.log(`[CRON] Executing job ${jobId} of type ${type}`)

    await prismaLocal.cronJob.update({
      where: { id: jobId },
      data: { last_run: new Date() }
    })

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
        default:
          console.warn(`[CRON] Unknown sync type: ${type}`)
          return
      }

      console.log(`[CRON] Job ${jobId} (${type}) finished:`, result.message)
    } catch (e) {
      console.error(`[CRON] Job ${jobId} (${type}) failed:`, e)
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

  public async loadJobs() {
    console.log('[CRON] Loading active jobs from database...')

    this.tasks.forEach(task => task.stop())
    this.tasks.clear()
    this.jobOrder.clear()

    try {
      let jobs
      try {
        jobs = await prismaLocal.cronJob.findMany({
          where: { is_active: true },
          orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }],
        })
      } catch {
        jobs = await prismaLocal.cronJob.findMany({
          where: { is_active: true },
          orderBy: { created_at: 'desc' },
        })
      }

      jobs.forEach((job, index) => {
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
