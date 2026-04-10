export async function register() {
  // instrumentation.ts s'exécute à chaque démarrage d'instance Next.js
  // Idéal pour lancer le CronManager en mode standalone / production
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { cronManager } = await import('./lib/cronManager')
    console.log('[INSTRUMENTATION] Booting CronManager...')
    await cronManager.loadJobs()
  }
}
