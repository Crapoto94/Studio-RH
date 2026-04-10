import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const ziane = await prisma.refAgent.findFirst({
    where: { nom: 'ZIANE' }
  })
  
  if (ziane) {
    console.log('MATRICULE:', ziane.matricule)
    console.log('NOM:', ziane.nom)
    console.log('POSITION:', JSON.stringify(ziane.position_l))
    console.log('ACTIF:', ziane.actif)
  }
  
  const param = await prisma.parametre.findUnique({
    where: { cle: 'RH_POSITIONS_ACTIVES' }
  })
  console.log('PARAM:', JSON.stringify(param?.valeur))
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); })
