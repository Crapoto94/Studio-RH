import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const now = new Date()
  const agents = await prisma.refAgent.count({
    where: {
      date_depart: { lte: now },
      plus_vu: null
    }
  })
  console.log('Agents avec date_depart passée mais plus_vu null:', agents)
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); })
