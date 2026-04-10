import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const param = await prisma.parametre.findUnique({
    where: { cle: 'RH_POSITIONS_ACTIVES' }
  })
  console.log('--- POSITIONS ACTIVES ---')
  console.log(param?.valeur || 'VIDE')
  
  const ziane = await prisma.refAgent.findFirst({
    where: { nom: 'ZIANE' }
  })
  console.log('--- ZIANE POSITION ---')
  console.log(ziane?.position_l)
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); })
