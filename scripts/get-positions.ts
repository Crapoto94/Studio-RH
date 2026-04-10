import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const positions = await prisma.refAgent.findMany({
    select: { position_l: true },
    distinct: ['position_l'],
    where: { position_l: { not: null } }
  })
  console.log(JSON.stringify(positions.map(p => p.position_l)))
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); })
