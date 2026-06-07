import cron, { ScheduledTask } from 'node-cron'
import { prisma, prismaLocal } from './db'
import { runRhSync, runAdSync, runAzureSync, runBrutSync } from './sync'

class CronManager {
  private tasks: Map<number, ScheduledTask> = new Map()

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

const globalForCron = globalThis as unknown as {
  cronManager: CronManager | undefined
}

export const cronManager = globalForCron.cronManager ?? new CronManager()

if (process.env.NODE_ENV !== 'production') globalForCron.cronManager = cronManager
