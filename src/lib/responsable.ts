import { prisma } from '@/lib/db'
import type { RefAgent, HierarchyLevel } from '@prisma/client'

// Types d'entité de la hiérarchie, du plus bas (affectation) au plus haut (direction générale)
export type EntityType = 'affect' | 'secteur' | 'service' | 'direction' | 'dg'

// Correspondance avec le champ "level" (numérique) de HierarchyLevel
export const ENTITY_BUSINESS_LEVEL: Record<EntityType, number> = {
  affect: 0,
  secteur: 1,
  service: 2,
  direction: 3,
  dg: 4,
}

// Ordre de remontée pour la résolution du N+1 (du plus proche au plus haut)
export const ENTITY_CLIMB_ORDER: EntityType[] = ['affect', 'secteur', 'service', 'direction', 'dg']

// REF_AGENTS n'a pas de code_secteur (les agents ne sont rattachés qu'à une affectation) ;
// pour ce niveau on passe par REF_HIERARCHIE pour retrouver les affectations concernées.
async function getAffectCodesForSecteur(codeSecteur: string): Promise<string[]> {
  const rows = await prisma.refHierarchie.findMany({
    where: { code_secteur: codeSecteur },
    select: { code_affect: true }
  })
  return Array.from(new Set(rows.map(r => r.code_affect).filter((c): c is string => !!c)))
}

// Filtre Prisma (typé) pour retrouver les agents rattachés à une entité de la hiérarchie
async function buildAgentFilter(entityType: EntityType, code: string): Promise<any | null> {
  switch (entityType) {
    case 'dg': return { code_dg_cab: code }
    case 'direction': return { code_direction: code }
    case 'service': return { code_service: code }
    case 'affect': return { code_affect: code }
    case 'secteur': {
      const affects = await getAffectCodesForSecteur(code)
      if (affects.length === 0) return null
      return { code_affect: { in: affects } }
    }
  }
}

export async function getAgentsForNode(entityType: EntityType, code: string): Promise<RefAgent[]> {
  const filter = await buildAgentFilter(entityType, code)
  if (!filter) return []
  return prisma.refAgent.findMany({
    where: { AND: [filter, { actif: true }] },
    orderBy: [{ nom: 'asc' }, { prenom: 'asc' }]
  })
}

// Colonnes réelles de BRUT_RH (la casse est préservée par Prisma car déclarée telle quelle
// dans le schéma, donc toute référence en SQL brut doit être entre guillemets doubles).
const BRUT_RH_COLUMNS = [
  'MATRICULE', 'NOM', 'PRENOM', 'STATUT', 'STATUT_L', 'DIRECTION', 'DIRECTION_L',
  'SERVICE', 'SERVICE_L', 'PST_AFFECT', 'PST_AFFECT_L', 'AFFECT', 'AFFECT_L',
  'POSTE', 'POSTE_L', 'FONCTION', 'FONCTION_L', 'AFFECTGEO', 'AFFECTGEO_L',
  'AGT_GRADE', 'AGT_GRADE_L', 'PST_CADREMP', 'PST_CADREMP_L', 'PST_CAT',
  'DATE_ARRIVEE', 'MOTIF_ARRIVEE', 'DATE_DEPART', 'MOTIF_DEPART',
  'DATE_MODIF_DOSS', 'DATE_EXTRACT_DOSS', 'DATE_MAJ', 'COLLECTIVITE',
  'COLLECTIVITE_L', 'POSITION', 'POSITION_L', 'FIN_PREV_POS', 'CIVILITE',
  'EMAIL_PERSO', 'EMAIL_PRO', 'TELEPHONE_PRO', 'MOBILE_PRO', 'TEMPS_PARTIEL',
  'TEMPS_PARTIEL_L', 'ID_AGENT', 'ID_AGENT_ABS', 'DG_CAB', 'DG_CAB_L',
]

// Permet de saisir la règle "responsable" en écriture naturelle (ex: POSTE LIKE 'DIR%')
// en ajoutant automatiquement les guillemets requis par Postgres pour les colonnes de BRUT_RH.
function quoteRuleColumns(rule: string): string {
  let out = rule
  for (const col of BRUT_RH_COLUMNS) {
    const re = new RegExp(`(?<!")\\b${col}\\b(?!")`, 'gi')
    out = out.replace(re, `"${col}"`)
  }
  return out
}

const BRUT_RH_CODE_COLUMN: Partial<Record<EntityType, string>> = {
  dg: 'DG_CAB', direction: 'DIRECTION', service: 'SERVICE', affect: 'AFFECT'
}

export interface ResolveResponsablesResult {
  agents: RefAgent[]
  // Diagnostic : nombre de lignes BRUT_RH utilisées pour restreindre la recherche (0 = la
  // jointure vers BRUT_RH n'a rien trouvé pour ce code, indépendamment de la règle elle-même),
  // et message d'erreur si la règle SQL a fait planter la requête.
  scopeRowCount: number
  error?: string
}

// Résout le ou les agents "responsables" d'une entité de la hiérarchie, selon la règle SQL
// libre du niveau (HierarchyLevel.responsable_sql, ex: POSTE LIKE 'DIR%'). La règle est
// évaluée sur BRUT_RH (données brutes RH, mêmes noms de colonnes que la règle attend),
// restreinte aux lignes de l'entité concernée, puis reliée à REF_AGENTS par matricule.
export async function resolveResponsablesForNode(
  level: Pick<HierarchyLevel, 'responsable_sql'> | null | undefined,
  entityType: EntityType,
  code: string
): Promise<ResolveResponsablesResult> {
  const rule = level?.responsable_sql?.trim()
  if (!rule) return { agents: [], scopeRowCount: 0 }

  try {
    let rows: { MATRICULE: string | null }[]
    let scopeRowCount: number

    if (entityType === 'secteur') {
      const affects = await getAffectCodesForSecteur(code)
      if (affects.length === 0) return { agents: [], scopeRowCount: 0 }
      scopeRowCount = await prisma.brutRh.count({ where: { AFFECT: { in: affects } } })
      const sql = `SELECT "MATRICULE" FROM "BRUT_RH" WHERE "AFFECT" = ANY($1) AND (${quoteRuleColumns(rule)})`
      rows = await prisma.$queryRawUnsafe<{ MATRICULE: string | null }[]>(sql, affects)
    } else {
      const col = BRUT_RH_CODE_COLUMN[entityType]
      if (!col) return { agents: [], scopeRowCount: 0 }
      scopeRowCount = await prisma.brutRh.count({ where: { [col]: code } as any })
      const sql = `SELECT "MATRICULE" FROM "BRUT_RH" WHERE "${col}" = $1 AND (${quoteRuleColumns(rule)})`
      rows = await prisma.$queryRawUnsafe<{ MATRICULE: string | null }[]>(sql, code)
    }

    const matricules = Array.from(new Set(rows.map(r => r.MATRICULE).filter((m): m is string => !!m)))
    if (matricules.length === 0) return { agents: [], scopeRowCount }

    const agents = await prisma.refAgent.findMany({
      where: { matricule: { in: matricules }, actif: true },
      orderBy: [{ nom: 'asc' }, { prenom: 'asc' }]
    })
    return { agents, scopeRowCount }
  } catch (err: any) {
    // Règle SQL invalide (saisie admin) : on ignore plutôt que de casser l'affichage
    console.error(`[responsable_sql] Règle invalide pour le niveau ${entityType}:`, err)
    return { agents: [], scopeRowCount: 0, error: err?.message || String(err) }
  }
}

export interface NPlus1Step {
  type: EntityType
  levelName: string | null
  code: string | null
  ruleConfigured: boolean
  // Nombre de lignes BRUT_RH trouvées pour ce code, avant application de la règle (0 = le
  // code de l'agent/du secteur ne correspond à rien dans BRUT_RH pour ce niveau).
  scopeRowCount: number
  matches: string[]
  error?: string
}

export interface NPlus1Result {
  responsable: RefAgent
  resolvedAt: { type: EntityType; code: string; levelName: string }
}

// Remonte la hiérarchie depuis l'affectation de l'agent jusqu'à trouver un "responsable"
// (au sens de la règle SQL du niveau) qui ne soit pas l'agent lui-même. `trace`, si fourni,
// est rempli avec le détail de chaque niveau examiné (diagnostic).
export async function resolveNPlus1(agent: RefAgent, trace?: NPlus1Step[]): Promise<NPlus1Result | null> {
  const levels = await prisma.hierarchyLevel.findMany()
  const levelByBusiness = new Map(levels.map(l => [l.level, l]))

  const path = agent.code_affect
    ? await prisma.refHierarchie.findFirst({ where: { code_affect: agent.code_affect } })
    : null

  const codeForType: Record<EntityType, string | null | undefined> = {
    affect: agent.code_affect,
    secteur: path?.code_secteur,
    service: agent.code_service,
    direction: agent.code_direction,
    dg: agent.code_dg_cab,
  }

  for (const type of ENTITY_CLIMB_ORDER) {
    const code = codeForType[type]
    const level = levelByBusiness.get(ENTITY_BUSINESS_LEVEL[type])

    if (!code) {
      trace?.push({ type, levelName: level?.name ?? null, code: null, ruleConfigured: !!level?.responsable_sql?.trim(), scopeRowCount: 0, matches: [] })
      continue
    }
    if (!level?.responsable_sql?.trim()) {
      trace?.push({ type, levelName: level?.name ?? null, code, ruleConfigured: false, scopeRowCount: 0, matches: [] })
      continue
    }

    const { agents: responsables, scopeRowCount, error } = await resolveResponsablesForNode(level, type, code)
    trace?.push({
      type, levelName: level.name, code, ruleConfigured: true, scopeRowCount,
      matches: responsables.map(r => `${r.prenom} ${r.nom}`), error
    })

    const candidate = responsables.find(r => r.id !== agent.id)
    if (candidate) {
      return { responsable: candidate, resolvedAt: { type, code, levelName: level.name } }
    }
    // Si l'agent est lui-même le seul responsable trouvé à ce niveau, on continue à monter.
  }

  return null
}
