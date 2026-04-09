export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { cronManager } = await import('./lib/cronManager')
    
    // Pour éviter de charger les crons plusieurs fois en mode dev
    if (process.env.NODE_ENV !== 'production') {
      if (!(global as any).__CRON_STARTED__) {
        (global as any).__CRON_STARTED__ = true
        cronManager.loadJobs()
      }
    } else {
      cronManager.loadJobs()
    }
  }
}
