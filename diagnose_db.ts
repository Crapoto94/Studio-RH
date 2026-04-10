import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    const tables = [
      'BrutRh', 'BrutHierarchie', 'BrutAd', 'BrutAzure', 
      'RefAgent', 'RefHierarchie', 'SynchroLog'
    ]
    
    console.log('--- DIAGNOSTIC DATA ---')
    for (const table of tables) {
      try {
        const count = await (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)].count()
        console.log(`${table}: ${count} rows`)
      } catch (e: any) {
        console.log(`${table}: ERROR - ${e.message}`)
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

main()
