import { prisma } from '@/lib/db'
import { resolveAcronyme } from '@/lib/utils'

export interface HierarchyRebuildResult {
  paths: number
  created: number
  updated: number
  deleted: number
  acronymesCreated: number
}

// Règle DSI Ivry : si le DG est vide, on cherche un parent par préfixe de code.
// Ex : direction = 'BF' -> on cherche si 'B' existe comme entité racine.
function enrichDgCab(rawData: any[]) {
  return rawData.map(item => {
    let code_dg = item.code_dg_cab || ''
    let nom_dg = item.nom_dg_cab_l || ''

    if (!code_dg && item.code_direction && item.code_direction.length >= 2) {
      const prefix = item.code_direction.substring(0, 1)
      const parent = rawData.find(p => p.code_affect === prefix)
      if (parent) {
        code_dg = parent.code_affect ?? ''
        nom_dg = parent.nom_affect_l ?? ''
      }
    }

    return { ...item, code_dg_cab: code_dg, nom_dg_cab_l: nom_dg }
  })
}

const ICON_KEYWORDS: Record<string, string> = {
  DSI: 'monitor',
  RH: 'users',
  FINANCE: 'banknote',
  COMM: 'megaphone',
  CULTURE: 'clapperboard',
  SPORT: 'trophy',
  JEUNESSE: 'baby',
  TECHNIQUE: 'wrench',
  URBA: 'building',
  SOCIAL: 'heart',
  ENVIRONNEMENT: 'leaf',
  ECOLE: 'graduation-cap',
}

function suggestIcon(name: string) {
  if (!name) return 'building'
  const upper = name.toUpperCase()
  for (const [kw, icon] of Object.entries(ICON_KEYWORDS)) {
    if (upper.includes(kw)) return icon
  }
  return 'building'
}

const pathKey = (r: {
  code_dg_cab?: string | null
  code_direction?: string | null
  code_service?: string | null
  code_secteur?: string | null
  code_affect?: string | null
}) =>
  `${r.code_dg_cab || 'X'}-${r.code_direction || 'X'}-${r.code_service || 'X'}-${r.code_secteur || 'X'}-${r.code_affect || 'X'}`

/**
 * Reconstruit REF_HIERARCHIE (et les acronymes associés) à partir des données
 * brutes BRUT_HIERARCHIE. L'unicité est basée sur le chemin complet
 * (dg > direction > service > secteur > affectation) : un même code_affect peut
 * apparaître dans plusieurs directions, il ne doit donc jamais servir de clé seul.
 */
export async function rebuildHierarchie(): Promise<HierarchyRebuildResult> {
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

  // 2. Données brutes + enrichissement DGA
  const rawData = await prisma.brutHierarchie.findMany()
  const enrichedData = enrichDgCab(rawData)

  // 3. Déduplication par chemin complet
  const uniquePaths = new Map<string, any>()
  for (const r of enrichedData) {
    const key = pathKey(r)
    if (!uniquePaths.has(key)) {
      uniquePaths.set(key, r)
    }
  }

  // 4. Upsert dans RefHierarchie
  let createdCount = 0
  let updatedCount = 0
  for (const [, r] of uniquePaths.entries()) {
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
      updatedCount++
    }
  }

  // 5. Upsert des acronymes par entité (dg / direction / service / secteur / affect).
  // Une fois modifié à la main (modifie=true), l'acronyme n'est plus écrasé.
  const acronymeEntries: { type: string; code: string; nom: string }[] = []
  const seenAcronymeKeys = new Set<string>()
  for (const r of enrichedData) {
    const candidates: [string, string | null | undefined, string | null | undefined][] = [
      ['dg', r.code_dg_cab, r.nom_dg_cab_l],
      ['direction', r.code_direction, r.nom_direction_l],
      ['service', r.code_service, r.nom_service_l],
      ['secteur', r.code_secteur, r.nom_secteur_l],
      ['affect', r.code_affect, r.nom_affect_l],
    ]
    for (const [type, code, nom] of candidates) {
      if (!code) continue
      const key = `${type}-${code}`
      if (seenAcronymeKeys.has(key)) continue
      seenAcronymeKeys.add(key)
      acronymeEntries.push({ type, code, nom: nom || '' })
    }
  }

  let acronymesCreated = 0
  for (const { type, code, nom } of acronymeEntries) {
    const existing = await prisma.hierarchieAcronyme.findUnique({
      where: { type_code: { type, code } }
    })

    if (!existing) {
      await prisma.hierarchieAcronyme.create({
        data: { type, code, nom, acronyme: resolveAcronyme(nom) || code, modifie: false }
      })
      acronymesCreated++
    } else if (!existing.modifie) {
      await prisma.hierarchieAcronyme.update({
        where: { id: existing.id },
        data: { nom, acronyme: resolveAcronyme(nom) || existing.acronyme }
      })
    } else if (existing.nom !== nom) {
      await prisma.hierarchieAcronyme.update({
        where: { id: existing.id },
        data: { nom }
      })
    }
  }

  // 6. Supprimer les chemins obsolètes (absents des données brutes actuelles)
  const validKeys = new Set(uniquePaths.keys())
  const allExisting = await prisma.refHierarchie.findMany({
    select: {
      id: true,
      code_dg_cab: true,
      code_direction: true,
      code_service: true,
      code_secteur: true,
      code_affect: true
    }
  })
  const staleIds = allExisting
    .filter(r => !validKeys.has(pathKey(r)))
    .map(r => r.id)

  let deletedCount = 0
  if (staleIds.length > 0) {
    const result = await prisma.refHierarchie.deleteMany({
      where: { id: { in: staleIds } }
    })
    deletedCount = result.count
  }

  return {
    paths: uniquePaths.size,
    created: createdCount,
    updated: updatedCount,
    deleted: deletedCount,
    acronymesCreated
  }
}
