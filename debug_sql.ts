import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- SQL DEBUG ---')
  try {
    const tables = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    console.log('Tables found:', JSON.stringify(tables, null, 2))
    
    if (Array.isArray(tables) && tables.some((t: any) => t.name === 'REF_AGENTS')) {
      const sample = await prisma.$queryRawUnsafe('SELECT * FROM "REF_AGENTS" LIMIT 2')
      console.log('Sample from REF_AGENTS:', JSON.stringify(sample, null, 2))
    } else {
      console.log('WARNING: REF_AGENTS table not found in this database file!')
    }
  } catch (error: any) {
    console.error('ERROR during raw query:', error.message)
    console.error('Stack:', error.stack)
  }
}

main().finally(() => prisma.$disconnect())
