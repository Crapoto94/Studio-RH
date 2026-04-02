import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date().toISOString()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Requêtes SQL Brutes pour contourner les limitations de l'abstraction Prisma/SQLite
    const [newAgentsRes, recentlyLeftRes, futureAgentsRes] = await Promise.all([
      // Nouveaux agents (-30j)
      prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "REF_AGENTS" WHERE date_arrivee BETWEEN '${thirtyDaysAgo}' AND '${now}'`),
      // Agents partis (-30j)
      prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "REF_AGENTS" WHERE date_depart BETWEEN '${thirtyDaysAgo}' AND '${now}'`),
      // Futurs agents
      prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "REF_AGENTS" WHERE date_arrivee > '${now}'`)
    ])

    const getCount = (res: any) => Number(res[0]?.count || 0)

    return NextResponse.json({
      newAgents: getCount(newAgentsRes),
      recentlyLeft: getCount(recentlyLeftRes),
      futureAgents: getCount(futureAgentsRes)
    })
  } catch (error) {
    console.error('API Counts Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
