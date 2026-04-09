import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Utilisation de Prisma count (correctement géré par Prisma 5.14 avec SQLite)
    const [newAgents, recentlyLeft, futureAgents] = await Promise.all([
      // Nouveaux agents (-30j)
      prisma.refAgent.count({
        where: {
          date_arrivee: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), lte: new Date() }
        }
      }),
      // Agents partis (-30j)
      prisma.refAgent.count({
        where: {
          OR: [
            { date_depart: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), lte: new Date() } },
            { 
              actif: false, 
              plus_vu: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), lte: new Date() } 
            }
          ]
        }
      }),
      // Futurs agents
      prisma.refAgent.count({
        where: {
          date_arrivee: { gt: new Date() }
        }
      })
    ])

    return NextResponse.json({
      newAgents,
      recentlyLeft,
      futureAgents
    })
  } catch (error) {
    console.error('API Counts Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
