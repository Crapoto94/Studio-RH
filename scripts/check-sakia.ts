import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const agent = await prisma.refAgent.findFirst({
    where: {
      OR: [
        { nom: { contains: 'ZIANE' } },
        { prenom: { contains: 'SAKIA' } }
      ]
    }
  })
  
  if (!agent) {
    console.log('Agent non trouvé')
    return
  }
  
  console.log('--- AGENT SAKIA ZIANE ---')
  console.log(JSON.stringify(agent, null, 2))
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); })
