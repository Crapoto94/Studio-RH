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
    const agents = await prisma.refAgent.findMany()
    results.agents.total = agents.length
    results.agents.sample = agents.slice(0, 5).map(a => ({ id: a.id, nom: a.nom, date_arrivee: a.date_arrivee, date_depart: a.date_depart, plus_vu: a.plus_vu }))
    
    for (const agent of (agents as any[])) {
      try {
        let updateNeeded = false
        const fieldsToFix = ['date_arrivee', 'date_depart', 'plus_vu']
        for (const field of fieldsToFix) {
          const val = agent[field]
          if (isInvalidDate(val)) {
            const d = parseDate(val)
            if (d) {
              await (prisma.refAgent as any).update({
                where: { id: agent.id },
                data: { [field]: d }
              })
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
    const onboardings = await prisma.onboarding.findMany()
    results.onboardings.total = onboardings.length
    results.onboardings.sample = onboardings.slice(0, 5).map(o => ({ id: o.id, agent_id: o.agent_id, date_arrivee_prevue: o.date_arrivee_prevue }))

    for (const ob of onboardings) {
      try {
        const val = ob.date_arrivee_prevue
        if (isInvalidDate(val)) {
          const d = parseDate(val)
          if (d) {
            await prisma.onboarding.update({
              where: { id: ob.id },
              data: { date_arrivee_prevue: d }
            })
            results.onboardings.migrated++
          }
        }
      } catch (e: any) {
        results.onboardings.errors.push({ id: ob.id, error: e.message })
      }
    }

    // --- MIGRATION ONBOARDING_TASKS ---
    const tasks = await prisma.onboardingTask.findMany()
    results.tasks.total = tasks.length
    for (const task of tasks) {
      try {
        const val = task.date_completion
        if (isInvalidDate(val)) {
          const d = parseDate(val)
          if (d) {
            await prisma.onboardingTask.update({
              where: { id: task.id },
              data: { date_completion: d }
            })
            results.tasks.migrated++
          }
        }
      } catch (e: any) {
        results.tasks.errors.push({ id: task.id, error: e.message })
      }
    }

    // --- DIAGNOSTIQUE DE REQUÊTE ---
    const now = new Date()
    const futurePrismaCount = await prisma.refAgent.count({
      where: {
        date_arrivee: { gt: now }
      }
    })

    const sampleFuture = await prisma.refAgent.findMany({
      where: { date_arrivee: { gt: now } },
      select: { id: true, nom: true, date_arrivee: true },
      take: 3
    })

    return NextResponse.json({ 
      success: true, 
      message: "Analyse et diagnostic terminés.",
      stats: results,
      debug: {
        server_now: now.toISOString(),
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
