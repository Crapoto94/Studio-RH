import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    const count = await prisma.refAgent.count()
    console.log('Successfully reached DB! Total agents:', count)
  } catch (err) {
    console.error('Failed to reach DB from script:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
