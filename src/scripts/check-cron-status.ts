import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('--- VÉRIFICATION DES CRONS ET LOGS (Autour de 11h) ---')
  
  const jobs = await prisma.cronJob.findMany()
  console.log('\nCRON JOBS ACTIVÉS :')
  console.table(jobs.map(j => ({
    id: j.id,
    name: j.name,
    active: j.is_active,
    last_run: j.last_run,
    schedule: j.schedule,
    type: j.schedule_type
  })))

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const recentLogs = await prisma.synchroLog.findMany({
    where: {
      created_at: {
        gte: today
      }
    },
    orderBy: { created_at: 'desc' },
    take: 10
  })

  console.log('\nLOGS DE SYNCHRO RÉCENTS (AUJOURDHUI) :')
  console.table(recentLogs.map(l => ({
    time: l.created_at.toLocaleString('fr-FR'),
    type: l.type,
    statut: l.statut,
    message: l.message
  })))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
