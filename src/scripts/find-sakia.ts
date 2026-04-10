import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const agents = await prisma.refAgent.findMany({
    where: {
      OR: [
        { nom: { contains: 'ZIANE' } },
        { prenom: { contains: 'SAKIA' } }
      ]
    }
  })
  
  console.log(JSON.stringify(agents, null, 2))
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); })
