import { NextRequest, NextResponse } from 'next/server'
import { prisma, prismaLocal } from '@/lib/db'
import { z } from 'zod'

const getCountsSchema = z.object({
  search: z.string().optional(),
  direction: z.string().optional(),
  service: z.string().optional(),
  position: z.string().optional()
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = getCountsSchema.parse(Object.fromEntries(searchParams))

    // Construction des conditions de filtrage communes
    const commonConditions: any[] = []
    if (query.search) {
      commonConditions.push({
        OR: [
          { nom: { contains: query.search } },
          { prenom: { contains: query.search } },
          { matricule: { contains: query.search } },
          { ad_id: { contains: query.search } }
        ]
      })
    }
    if (query.direction) commonConditions.push({ nom_direction: { contains: query.direction } })
    if (query.service) commonConditions.push({ nom_service: { contains: query.service } })
    if (query.position) commonConditions.push({ position_l: { equals: query.position } })

    const whereBase = commonConditions.length > 0 ? { AND: commonConditions } : {}

    // Utilisation de Prisma count (correctement géré par Prisma 5.14 avec SQLite)
    const now = new Date()
    const todayMidnight = new Date()
    todayMidnight.setHours(0, 0, 0, 0)
    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Charger les positions actives depuis le paramétrage RH
    const params = await prismaLocal.parametre.findMany()
    const config = Object.fromEntries(params.map((p: any) => [p.cle, p.valeur]))
    const activePositions = (config['RH_POSITIONS_ACTIVES'] || '').split(',').filter(Boolean)

    const [activeAgents, newAgents, recentlyLeft, allTimeLeft, futureAgents, multiAdAgents, noAzureAgents] = await Promise.all([
      // ... (active agents block remains same)
      prisma.refAgent.count({ 
        where: { 
          ...whereBase,
          OR: [
            { date_depart: null, plus_vu: null },
            { date_depart: { gt: now } }
          ],
          ...(activePositions.length > 0 ? { position_l: { in: activePositions } } : {})
        } 
      }),
      // Nouveaux agents (-30j)
      prisma.refAgent.count({
        where: {
          ...whereBase,
          date_arrivee: { gte: thirtyDaysAgo, lte: now },
          actif: true,
          OR: [
            { date_depart: null, plus_vu: null },
            { date_depart: { gt: now } }
          ]
        }
      }),
      // Agents partis récemment
      prisma.refAgent.count({
        where: {
          ...whereBase,
          OR: [
            { date_depart: null, plus_vu: { gte: thirtyDaysAgo } },
            { date_depart: { gte: thirtyDaysAgo, lte: now } }
          ]
        }
      }),
      // Tous les agents partis
      prisma.refAgent.count({
        where: {
          ...whereBase,
          OR: [
            { date_depart: null, plus_vu: { not: null } },
            { date_depart: { lte: now } }
          ]
        }
      }),
      // Futurs agents
      prisma.refAgent.count({
        where: {
          ...whereBase,
          date_arrivee: { gt: now },
          actif: true,
          OR: [
            { date_depart: null, plus_vu: null },
            { date_depart: { gt: now } }
          ]
        }
      }),
      // Multi-comptes AD
      prisma.refAgent.count({
        where: {
          ...whereBase,
          extra_ad_links: { some: {} }
        }
      }),
      // Sans lien Azure
      prisma.refAgent.count({
        where: {
          ...whereBase,
          azure_id: null,
          actif: true,
          OR: [
            { date_depart: null, plus_vu: null },
            { date_depart: { gt: now } }
          ]
        }
      })
    ])

    return NextResponse.json({
      activeAgents,
      newAgents,
      recentlyLeft,
      allTimeLeft,
      futureAgents,
      multiAdAgents,
      noAzureAgents
    })
  } catch (error) {
    console.error('API Counts Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
