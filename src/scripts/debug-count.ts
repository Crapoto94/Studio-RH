import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function test() {
  const now = new Date()
  
  const allCount = await prisma.refAgent.count()
  console.log('Total agents:', allCount)
  
  const activeCount = await prisma.refAgent.count({
    where: {
      plus_vu: null,
      actif: true,
      OR: [
        { date_depart: null },
        { date_depart: { gt: now } }
      ]
    }
  })
  console.log('Active agents (query):', activeCount)
  
  const justActif = await prisma.refAgent.count({ where: { actif: true } })
  console.log('justActif:', justActif)
  
  const justPlusVu = await prisma.refAgent.count({ where: { plus_vu: null } })
  console.log('justPlusVu null:', justPlusVu)
  
  const sample = await prisma.refAgent.findFirst({
     where: { type: undefined } as any // to just get any
  })
  if (sample) {
    console.log('Sample date_depart:', sample.date_depart, typeof sample.date_depart)
  }
}

test().finally(() => prisma.$disconnect())
