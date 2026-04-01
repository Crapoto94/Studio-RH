import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const getAgentsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  search: z.string().optional(),
  direction: z.string().optional(),
  service: z.string().optional(),
  statut: z.string().optional(),
  dateArriveeMin: z.string().optional(),
  dateArriveeMax: z.string().optional(),
  dateDepartMin: z.string().optional(),
  dateDepartMax: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = getAgentsSchema.parse(Object.fromEntries(searchParams))

    const where: any = {}

    // Multi-criteria search
    if (query.search) {
      where.OR = [
        { nom: { contains: query.search } },
        { prenom: { contains: query.search } },
        { matricule: { contains: query.search } },
        { poste_l: { contains: query.search } }
      ]
    }

    if (query.direction) where.nom_direction = { contains: query.direction }
    if (query.service) where.nom_service = { contains: query.service }
    if (query.statut) where.position_l = { contains: query.statut }

    // Date filters (SQLite compatible using ISO strings for comparisons)
    if (query.dateArriveeMin || query.dateArriveeMax) {
      where.date_arrivee = {}
      if (query.dateArriveeMin) where.date_arrivee.gte = new Date(query.dateArriveeMin).toISOString()
      if (query.dateArriveeMax) where.date_arrivee.lte = new Date(query.dateArriveeMax).toISOString()
    }

    if (query.dateDepartMin || query.dateDepartMax) {
      where.date_depart = {}
      if (query.dateDepartMin) where.date_depart.gte = new Date(query.dateDepartMin).toISOString()
      if (query.dateDepartMax) where.date_depart.lte = new Date(query.dateDepartMax).toISOString()
    }

    const [agents, totalCount] = await Promise.all([
      prisma.refAgent.findMany({
        where,
        orderBy: { nom: 'asc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      prisma.refAgent.count({ where })
    ])

    return NextResponse.json({
      data: agents,
      count: totalCount,
      page: query.page,
      totalPages: Math.ceil(totalCount / query.limit),
    })
  } catch (error) {
    console.error('API Agents GET Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
