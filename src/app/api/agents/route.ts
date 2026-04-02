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
    
    // --- CONSTRUCTION DE LA REQUÊTE SQL BRUTE ---
    // (Plus fiable pour SQLite que l'abstraction Prisma sur les dates)
    let whereConditions = ["1=1"]
    const params: any[] = []

    if (query.search) {
      whereConditions.push(`(nom LIKE ? OR prenom LIKE ? OR matricule LIKE ? OR poste_l LIKE ?)`)
      const pattern = `%${query.search}%`
      params.push(pattern, pattern, pattern, pattern)
    }

    if (query.direction) {
      whereConditions.push(`nom_direction LIKE ?`)
      params.push(`%${query.direction}%`)
    }

    if (query.service) {
      whereConditions.push(`nom_service LIKE ?`)
      params.push(`%${query.service}%`)
    }

    if (query.statut) {
      whereConditions.push(`position_l LIKE ?`)
      params.push(`%${query.statut}%`)
    }

    // Filtres de dates (Format ISO strict)
    if (query.dateArriveeMin) {
      whereConditions.push(`date_arrivee >= ?`)
      params.push(new Date(query.dateArriveeMin).toISOString())
    }
    if (query.dateArriveeMax) {
      const d = new Date(query.dateArriveeMax)
      if (query.dateArriveeMax !== '2099-12-31') d.setHours(23, 59, 59, 999)
      else d.setFullYear(2099, 11, 31)
      whereConditions.push(`date_arrivee <= ?`)
      params.push(d.toISOString())
    }

    if (query.dateDepartMin) {
      whereConditions.push(`date_depart >= ?`)
      params.push(new Date(query.dateDepartMin).toISOString())
    }
    if (query.dateDepartMax) {
      const d = new Date(query.dateDepartMax)
      d.setHours(23, 59, 59, 999)
      whereConditions.push(`date_depart <= ?`)
      params.push(d.toISOString())
    }

    const whereClause = whereConditions.join(" AND ")
    
    // On lance les deux requêtes en parallèle (Données + Total)
    const [agents, countRes] = await Promise.all([
      prisma.$queryRawUnsafe(
        `SELECT * FROM "REF_AGENTS" WHERE ${whereClause} ORDER BY nom ASC LIMIT ${query.limit} OFFSET ${offset}`,
        ...params
      ) as Promise<any[]>,
      prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM "REF_AGENTS" WHERE ${whereClause}`,
        ...params
      ) as Promise<any[]>
    ])

    const totalCount = Number(countRes[0]?.count || 0)

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
