import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('--- RECALCUL DES FLAGS ACTIF ---')
  
  // 1. Récupérer les positions actives
  const param = await prisma.parametre.findUnique({
    where: { cle: 'RH_POSITIONS_ACTIVES' }
  })
  if (!param) {
    console.error('Paramètre RH_POSITIONS_ACTIVES non trouvé')
    return
  }
  
  const activePositions = param.valeur.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  console.log(`${activePositions.length} positions actives trouvées.`)
  
  // 2. Récupérer les agents présents (plus_vu null)
  const agents = await prisma.refAgent.findMany({
    where: { plus_vu: null }
  })
  console.log(`${agents.length} agents présents à traiter.`)
  
  let fixedCount = 0
  for (const agent of agents) {
    const currentPos = (agent.position_l || '').trim().toLowerCase()
    const shouldBeActif = activePositions.length === 0 || activePositions.includes(currentPos)
    
    if (agent.actif !== shouldBeActif) {
      await prisma.refAgent.update({
        where: { id: agent.id },
        data: { actif: shouldBeActif }
      })
      fixedCount++
      console.log(`[FIX] Agent ${agent.nom} ${agent.prenom} (${agent.matricule}) : ${agent.actif} -> ${shouldBeActif}`)
    }
  }
  
  console.log(`--- TERMINE : ${fixedCount} agents mis à jour ---`)
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); })
