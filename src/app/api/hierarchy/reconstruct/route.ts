import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    // 1. Initialiser les niveaux par défaut si absents
    const defaultLevels = [
      { level: 4, name: 'Direction Générale' },
      { level: 3, name: 'Direction' },
      { level: 2, name: 'Service' },
      { level: 1, name: 'Secteur' },
      { level: 0, name: 'Affectation' },
    ]

    for (const l of defaultLevels) {
      await (prisma as any).hierarchyLevel.upsert({
        where: { level: l.level },
        update: {},
        create: l
      })
    }

    // 2. Récupérer les données brutes
    const rawData = await prisma.brutHierarchie.findMany()
    
    // 3. Enrichir les données avec la règle de parenté DGA (préfixes)
    const enrichedData = rawData.map(item => {
      let code_dg = item.code_dg_cab || ''
      let nom_dg = item.nom_dg_cab_l || ''

      // Règle DSI Ivry : Si le DG est vide, on cherche un parent par préfixe de code
      // Si direction = 'BF', on cherche si 'B' existe comme entité racine
      if (!code_dg && item.code_direction && item.code_direction.length >= 2) {
        const prefix = item.code_direction.substring(0, 1)
        const parent = rawData.find(p => p.code_affect === prefix)
        if (parent) {
          code_dg = parent.code_affect ?? ''
          nom_dg = parent.nom_affect_l ?? ''
        }
      }

      return {
        ...item,
        code_dg_cab: code_dg,
        nom_dg_cab_l: nom_dg
      }
    })

    // 4. Mapper pour unicité (basé sur tous les codes enrichis)
    const uniquePaths = new Map<string, any>()
    for (const r of enrichedData) {
      const key = `${r.code_dg_cab || 'X'}-${r.code_direction || 'X'}-${r.code_service || 'X'}-${r.code_secteur || 'X'}-${r.code_affect || 'X'}`
      if (!uniquePaths.has(key)) {
        uniquePaths.set(key, r)
      }
    }

    // 5. Upsert dans RefHierarchie
    let createdCount = 0
    const iconKeywords: Record<string, string> = {
      'DSI': 'monitor',
      'RH': 'users',
      'FINANCE': 'banknote',
      'COMM': 'megaphone',
      'CULTURE': 'clapperboard',
      'SPORT': 'trophy',
      'JEUNESSE': 'baby',
      'TECHNIQUE': 'wrench',
      'URBA': 'building',
      'SOCIAL': 'heart',
      'ENVIRONNEMENT': 'leaf',
      'ECOLE': 'graduation-cap',
    }

    const suggestIcon = (name: string) => {
      if (!name) return 'building'
      const upper = name.toUpperCase()
      for (const [kw, icon] of Object.entries(iconKeywords)) {
        if (upper.includes(kw)) return icon
      }
      return 'building'
    }

    for (const [key, r] of uniquePaths.entries()) {
      const existing = await prisma.refHierarchie.findFirst({
        where: {
          code_dg_cab: r.code_dg_cab,
          code_direction: r.code_direction,
          code_service: r.code_service,
          code_secteur: r.code_secteur,
          code_affect: r.code_affect
        }
      })

      if (!existing) {
        await prisma.refHierarchie.create({
          data: {
            code_dg_cab: r.code_dg_cab,
            nom_dg_cab_l: r.nom_dg_cab_l,
            code_direction: r.code_direction,
            nom_direction_l: r.nom_direction_l,
            code_service: r.code_service,
            nom_service_l: r.nom_service_l,
            code_secteur: r.code_secteur,
            nom_secteur_l: r.nom_secteur_l,
            code_affect: r.code_affect,
            nom_affect_l: r.nom_affect_l,
            icone: suggestIcon(r.nom_direction_l || ''),
            plus_vu: new Date()
          }
        })
        createdCount++
      } else {
        await prisma.refHierarchie.update({
          where: { id: existing.id },
          data: {
            nom_dg_cab_l: r.nom_dg_cab_l,
            nom_direction_l: r.nom_direction_l,
            nom_service_l: r.nom_service_l,
            nom_secteur_l: r.nom_secteur_l,
            nom_affect_l: r.nom_affect_l,
            plus_vu: new Date()
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reconstruction terminée : ${uniquePaths.size} chemins traités, ${createdCount} nouveaux créés.`,
      count: uniquePaths.size
    })

  } catch (error) {
    console.error('Hierarchy Reconstruction Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
