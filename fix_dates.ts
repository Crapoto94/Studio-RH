import { PrismaClient } from '@prisma/client'

const p = new PrismaClient()

async function fix() {
  console.log('--- FIXING MALFORMED DATES IN SQLite ---')
  const queries = [
    `UPDATE "REF_AGENTS" SET date_arrivee = null WHERE date_arrivee = '' OR date_arrivee = 'null' OR date_arrivee = 'undefined'`,
    `UPDATE "REF_AGENTS" SET date_depart = null WHERE date_depart = '' OR date_depart = 'null' OR date_depart = 'undefined'`,
    `UPDATE "REF_AGENTS" SET plus_vu = null WHERE plus_vu = '' OR plus_vu = 'null' OR plus_vu = 'undefined'`,

    // Format DD/MM/YYYY to YYYY-MM-DD
    `UPDATE "REF_AGENTS" SET date_arrivee = substr(date_arrivee, 7, 4) || '-' || substr(date_arrivee, 4, 2) || '-' || substr(date_arrivee, 1, 2) || 'T00:00:00.000Z' WHERE date_arrivee LIKE '__/__/____'`,
    `UPDATE "REF_AGENTS" SET date_depart = substr(date_depart, 7, 4) || '-' || substr(date_depart, 4, 2) || '-' || substr(date_depart, 1, 2) || 'T00:00:00.000Z' WHERE date_depart LIKE '__/__/____'`,
    `UPDATE "REF_AGENTS" SET plus_vu = substr(plus_vu, 7, 4) || '-' || substr(plus_vu, 4, 2) || '-' || substr(plus_vu, 1, 2) || 'T00:00:00.000Z' WHERE plus_vu LIKE '__/__/____'`
  ]

  for (const q of queries) {
    try {
      const res = await p.$executeRawUnsafe(q)
      console.log(`Success: ${q} (Affected rows: ${res})`)
    } catch (e: any) {
      console.log(`Error on: ${q}`)
      console.error(e.message)
    }
  }
}

fix().finally(() => p.$disconnect())
