import { PrismaClient } from '@prisma/client'

const p = new PrismaClient()

async function normalize() {
  console.log('--- NORMALIZING SQLITE DATES TO INTEGER (MILLIS) ---')
  const agents = await p.$queryRawUnsafe<any[]>(`SELECT matricule, date_arrivee, typeof(date_arrivee) as ta, date_depart, typeof(date_depart) as td, plus_vu, typeof(plus_vu) as tv FROM REF_AGENTS`)
  
  let modified = 0
  for (const a of agents) {
    let updates = []
    
    if (a.ta === 'text' && a.date_arrivee) {
      const ms = new Date(a.date_arrivee).getTime()
      if (!isNaN(ms)) updates.push(`date_arrivee = ${ms}`)
    }
    if (a.td === 'text' && a.date_depart) {
      const ms = new Date(a.date_depart).getTime()
      if (!isNaN(ms)) updates.push(`date_depart = ${ms}`)
    }
    if (a.tv === 'text' && a.plus_vu) {
      const ms = new Date(a.plus_vu).getTime()
      if (!isNaN(ms)) updates.push(`plus_vu = ${ms}`)
    }
    
    if (updates.length > 0) {
      const query = `UPDATE REF_AGENTS SET ${updates.join(', ')} WHERE matricule = '${a.matricule}'`
      await p.$executeRawUnsafe(query)
      modified++
    }
  }
  console.log(`Normalized ${modified} agents successfully.`)
}

normalize().finally(() => p.$disconnect())
