import { cronManager } from '../lib/cronManager'
import { prisma } from '../lib/db'

async function verify() {
  console.log('--- TEST DE DÉMARRAGE MANUEL DU CRONMANAGER ---')
  
  // Simulation de l'appel instrumentation
  console.log('Appel de cronManager.loadJobs()...')
  await cronManager.loadJobs()
  
  console.log('Chargement terminé. Vérification des tâches en base...')
  const activeJobs = await prisma.cronJob.findMany({ where: { is_active: true } })
  console.log(`${activeJobs.length} tâches actives trouvées en base.`)
  
  // On laisse tourner 2 secondes pour voir s'il y a des logs console (non bloquant ici)
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  console.log('Test unitaire terminé.')
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
