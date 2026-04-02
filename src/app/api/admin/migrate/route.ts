import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Fonction de parsing robuste pour SQLite (DD/MM/YYYY ou Timestamp vers Date)
function parseDate(val: any): Date | null {
  if (!val) return null
  
  // Si c'est déjà un timestamp numérique (ou une string numérique)
  if (typeof val === 'number' || (!isNaN(val) && !isNaN(parseFloat(val)))) {
    const d = new Date(Number(val))
    if (!isNaN(d.getTime())) return d
  }

  if (typeof val === 'string') {
    // DD/MM/YYYY
    const parts = val.split('/')
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const year = parseInt(parts[2], 10)
      const d = new Date(year, month, day)
      if (!isNaN(d.getTime())) return d
    }
    // ISO or other
    const iso = new Date(val)
    if (!isNaN(iso.getTime())) return iso
  }
  return null
}

export async function GET() {
  try {
    const results: any = { 
      agents: { total: 0, migrated: 0, errors: [], sample: [] }, 
      onboardings: { total: 0, migrated: 0, errors: [], sample: [] }, 
      tasks: { total: 0, migrated: 0, errors: [] } 
    }

    const isInvalidDate = (val: any) => {
      if (!val) return false
      if (typeof val === 'number') return true 
      if (typeof val === 'string' && !isNaN(val as any)) return true
      if (typeof val === 'string' && !val.includes('T')) return true 
      return false
    }

    // --- MIGRATION AGENTS ---
    const agents: any[] = await prisma.$queryRaw`SELECT * FROM "REF_AGENTS"`
    results.agents.total = agents.length
    results.agents.sample = agents.slice(0, 5).map(a => ({ id: a.id, nom: a.nom, date_arrivee: a.date_arrivee, date_depart: a.date_depart, plus_vu: a.plus_vu }))
    
    for (const agent of agents) {
      try {
        let updateNeeded = false
        const fieldsToFix = ['date_arrivee', 'date_depart', 'plus_vu']
        for (const field of fieldsToFix) {
          const val = agent[field]
          if (isInvalidDate(val)) {
            const d = parseDate(val)
            if (d) {
              const iso = d.toISOString()
              await prisma.$executeRawUnsafe(`UPDATE "REF_AGENTS" SET "${field}" = '${iso}' WHERE "id" = ${agent.id}`)
              updateNeeded = true
            }
          }
        }
        if (updateNeeded) results.agents.migrated++
      } catch (e: any) {
        results.agents.errors.push({ id: agent.id, error: e.message })
      }
    }

    // --- MIGRATION ONBOARDING ---
    const onboardings: any[] = await prisma.$queryRaw`SELECT * FROM "ONBOARDING"`
    results.onboardings.total = onboardings.length
    results.onboardings.sample = onboardings.slice(0, 5).map(o => ({ id: o.id, agent_id: o.agent_id, date_arrivee_prevue: o.date_arrivee_prevue }))

    for (const ob of onboardings) {
      try {
        const val = ob.date_arrivee_prevue
        if (isInvalidDate(val)) {
          const d = parseDate(val)
          if (d) {
            const iso = d.toISOString()
            await prisma.$executeRawUnsafe(`UPDATE "ONBOARDING" SET "date_arrivee_prevue" = '${iso}' WHERE "id" = ${ob.id}`)
            results.onboardings.migrated++
          }
        }
      } catch (e: any) {
        results.onboardings.errors.push({ id: ob.id, error: e.message })
      }
    }

    // --- MIGRATION ONBOARDING_TASKS ---
    const tasks: any[] = await prisma.$queryRaw`SELECT * FROM "ONBOARDING_TASKS"`
    results.tasks.total = tasks.length
    for (const task of tasks) {
      try {
        const val = task.date_completion
        if (isInvalidDate(val)) {
          const d = parseDate(val)
          if (d) {
            const iso = d.toISOString()
            await prisma.$executeRawUnsafe(`UPDATE "ONBOARDING_TASKS" SET "date_completion" = '${iso}' WHERE "id" = ${task.id}`)
            results.tasks.migrated++
          }
        }
      } catch (e: any) {
        results.tasks.errors.push({ id: task.id, error: e.message })
      }
    }

    // --- DIAGNOSTIQUE DE REQUÊTE ---
    const nowIso = new Date().toISOString()
    const futureSql: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "REF_AGENTS" WHERE date_arrivee > '${nowIso}'`)
    const futurePrismaCount = await prisma.refAgent.count({
      where: {
        date_arrivee: { gte: nowIso } as any
      }
    })

    const sampleFuture: any[] = await prisma.$queryRawUnsafe(`SELECT id, nom, date_arrivee FROM "REF_AGENTS" WHERE date_arrivee > '${nowIso}' LIMIT 3`)

    return NextResponse.json({ 
      success: true, 
      message: "Analyse et diagnostic terminés.",
      stats: results,
      debug: {
        server_now: nowIso,
        sql_future_count: Number((futureSql as any)[0]?.count || 0),
        prisma_future_count: futurePrismaCount,
        sample_future_data: sampleFuture,
        total_in_db: agents.length
      }
    })
  } catch (error: any) {
    console.error('Migration API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
