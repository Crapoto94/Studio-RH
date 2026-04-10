import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const agent = await prisma.refAgent.findFirst({
    where: {
      OR: [
        { nom: { contains: 'AHAMADA' } },
        { prenom: { contains: 'AHAMADA' } }
      ]
    },
    include: {
      extra_ad_links: true
    }
  })
  
  if (!agent) {
    console.log('Agent non trouvé')
    return
  }
  
  console.log('--- AGENT ---')
  console.log(JSON.stringify(agent, null, 2))
  
  // Chercher si son ad_id présumé est déjà utilisé par quelqu'un d'autre
  if (agent.ad_id) {
    const others = await prisma.refAgent.findMany({
      where: { ad_id: agent.ad_id, NOT: { id: agent.id } }
    })
    console.log(`--- AUTRES AGENTS AVEC ad_id ${agent.ad_id} ---`)
    console.log(JSON.stringify(others, null, 2))
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); })
