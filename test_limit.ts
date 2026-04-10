import { PrismaClient } from '@prisma/client'

const p = new PrismaClient()

async function test() {
  console.log('--- START INCREMENTAL TEST ---')
  for (let i = 0; i < 20; i++) {
    try {
      const r = await p.$queryRawUnsafe(`SELECT matricule, CAST(date_arrivee AS TEXT) as da, CAST(date_depart AS TEXT) as d_dep, CAST(plus_vu AS TEXT) as d_vu FROM "REF_AGENTS" LIMIT 1 OFFSET ${i}`)
      console.log(`Row ${i}: `, r)
      const r2 = await p.$queryRawUnsafe(`SELECT * FROM "REF_AGENTS" LIMIT 1 OFFSET ${i}`)
      console.log(`Row ${i} Full properties ok`)
    } catch (e: any) {
      console.log(`LIMIT 1 OFFSET ${i}: FAILED`)
      console.log(`Error Message: ${e.message}`)
      break
    }
  }
}

test().finally(() => p.$disconnect())
