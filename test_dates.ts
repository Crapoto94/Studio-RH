import { PrismaClient } from '@prisma/client'

const p = new PrismaClient()

async function check() {
  const futureNewDate = await p.refAgent.count({
    where: { date_arrivee: { gt: new Date() } }
  })
  
  const futureStrDate = await p.refAgent.count({
    where: { 
      date_arrivee: { 
        gte: new Date('2026-04-10'), 
        lte: new Date('2099-12-31T23:59:59.999Z') 
      } 
    }
  })
  
  console.log(`count with gt: new Date() => ${futureNewDate}`)
  console.log(`count with gte: 2026-04-10 => ${futureStrDate}`)

  const difference = await p.refAgent.findMany({
    where: {
      date_arrivee: { gt: new Date() },
      NOT: {
         date_arrivee: {
           gte: new Date('2026-04-10'), 
           lte: new Date('2099-12-31T23:59:59.999Z') 
         }
      }
    },
    select: { matricule: true, nom: true, prenom: true, date_arrivee: true },
    take: 5
  })

  console.log('Sample of missing agents in the bounded query:')
  difference.forEach(a => console.log(a.matricule, a.date_arrivee))
}

check().finally(() => p.$disconnect())
