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

    const offset = (query.page - 1) * query.limit
    // --- CONSTRUCTION DE LA REQUÊTE PRISMA ---
    // (L'abstraction Prisma gère correctement les dates avec SQLite 5.14)
    // --- CONSTRUCTION DE LA REQUÊTE PRISMA ---
    const conditions: any[] = []

    if (query.search) {
      conditions.push({
        OR: [
          { nom: { contains: query.search } },
          { prenom: { contains: query.search } },
          { matricule: { contains: query.search } },
          { poste_l: { contains: query.search } },
        ]
      })
    }

    if (query.direction) conditions.push({ nom_direction: { contains: query.direction } })
    if (query.service) conditions.push({ nom_service: { contains: query.service } })
    if (query.statut) conditions.push({ position_l: { contains: query.statut } })

    // Filtres de dates d'arrivée
    if (query.dateArriveeMin || query.dateArriveeMax) {
      const arriveeCond: any = {}
      if (query.dateArriveeMin) arriveeCond.gte = new Date(query.dateArriveeMin)
      if (query.dateArriveeMax) {
        const d = new Date(query.dateArriveeMax)
        if (query.dateArriveeMax !== '2099-12-31') d.setHours(23, 59, 59, 999)
        else d.setFullYear(2099, 11, 31)
        arriveeCond.lte = d
      }
      conditions.push({ date_arrivee: arriveeCond })
    }

    // Filtres de dates de départ (Inclut les agents disparus via plus_vu)
    if (query.dateDepartMin || query.dateDepartMax) {
      const departRange: any = {}
      if (query.dateDepartMin) departRange.gte = new Date(query.dateDepartMin)
      if (query.dateDepartMax) {
        const d = new Date(query.dateDepartMax)
        d.setHours(23, 59, 59, 999)
        departRange.lte = d
      }
      
      conditions.push({
        OR: [
          { date_depart: departRange },
          { 
            actif: false, 
            plus_vu: departRange 
          }
        ]
      })
    }

    const where = conditions.length > 0 ? { AND: conditions } : {}

    // On lance les deux requêtes en parallèle (Données + Total)
    const [agents, totalCount] = await Promise.all([
      prisma.refAgent.findMany({
        where,
        orderBy: { nom: 'asc' },
        take: query.limit,
        skip: offset
      }),
      prisma.refAgent.count({
        where
      })
    ])
    console.log(`[DEBUG] API Agents - Success: Found ${agents.length} agents (Total in DB: ${totalCount})`)

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
