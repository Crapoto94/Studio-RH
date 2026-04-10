import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const params = await prisma.parametre.findMany({
    where: { cle: { startsWith: 'MAIL_MSG' } }
  })
  console.log(JSON.stringify(params, null, 2))
}

main().finally(() => prisma.$disconnect())
