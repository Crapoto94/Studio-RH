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
  position: z.string().optional(),
  dateArriveeMin: z.string().optional(),
  dateArriveeMax: z.string().optional(),
  dateDepartMin: z.string().optional(),
  dateDepartMax: z.string().optional(),
  multiAdOnly: z.string().optional().transform(v => v === 'true'),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = getAgentsSchema.parse(Object.fromEntries(searchParams))

    const offset = (query.page - 1) * query.limit
    const conditions: any[] = []
    const now = new Date()

    if (query.multiAdOnly) {
      conditions.push({
        extra_ad_links: { some: {} }
      })
    }

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
    if (query.position) conditions.push({ position_l: { equals: query.position } })

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

      // Filtres de dates de départ (Basé sur plus_vu OU date_depart selon la règle utilisateur)
      if (query.dateDepartMin || query.dateDepartMax) {
        const dMin = query.dateDepartMin ? new Date(query.dateDepartMin) : null
        let dMax = query.dateDepartMax ? new Date(query.dateDepartMax) : null
        if (dMax) dMax.setHours(23, 59, 59, 999)
        
        conditions.push({
          OR: [
            { plus_vu: { gte: dMin || undefined, lte: dMax || undefined } },
            { date_depart: { gte: dMin || undefined, lte: dMax || undefined } }
          ]
        })
      }

    // Par défaut, si on ne cherche pas explicitement des agents partis ou inactifs, 
    // on masque ceux qui ont quitté (plus_vu != null)
    const isSearchQuery = !!query.search
    const isDepartQuery = !!query.dateDepartMin || !!query.dateDepartMax || (query.statut && query.statut.toLowerCase().includes('parti')) || (query.statut && query.statut.toLowerCase().includes('inactif'))
    
    if (!isDepartQuery && !isSearchQuery) {
      conditions.push({
        actif: true,
        OR: [
          { date_depart: null, plus_vu: null },
          { date_depart: { gt: now } }
        ]
      })
    }

    const where = conditions.length > 0 ? { AND: conditions } : {}

    // --- CALCULE DES DOUBLONS AD (Calcul global du partage) ---
    const sharedAdStats = await prisma.refAgent.groupBy({
      by: ['ad_id'],
      where: { NOT: { ad_id: null } },
      _count: { ad_id: true }
    })
    const sharedMap = new Map(sharedAdStats.map(s => [s.ad_id, s._count.ad_id]))

    // On lance les deux requêtes en parallèle (Données + Total)
    const [agents, totalCount] = await Promise.all([
      prisma.refAgent.findMany({
        where,
        include: {
          _count: {
            select: { extra_ad_links: true }
          }
        },
        orderBy: { nom: 'asc' },
        take: query.limit,
        skip: offset
      }),
      prisma.refAgent.count({
        where
      })
    ])

    const agentsWithCount = agents.map(a => {
      // Nombre de comptes possédés par l'agent
      const personalCount = (a.ad_id ? 1 : 0) + ((a as any)._count?.extra_ad_links || 0)
      
      // Nombre d'agents partageant le compte primaire (Doublons)
      const sharedCount = a.ad_id ? (sharedMap.get(a.ad_id) || 0) : 0
      
      return {
        ...a,
        // On affiche le chiffre le plus "critique" (Nombre de comptes ou Nombre de partages)
        ad_count: Math.max(personalCount, sharedCount)
      }
    })

    console.log(`[DEBUG] API Agents - Success: Found ${agents.length} agents (Total in DB: ${totalCount})`)

    return NextResponse.json({
      data: agentsWithCount,
      count: totalCount,
      page: query.page,
      totalPages: Math.ceil(totalCount / query.limit),
    })
  } catch (error) {
    console.error('API Agents GET Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
