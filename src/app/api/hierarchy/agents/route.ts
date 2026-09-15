import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAgentsForNode, resolveResponsablesForNode, ENTITY_BUSINESS_LEVEL, EntityType } from '@/lib/responsable'

// Liste les agents rattachés à un nœud de la hiérarchie (dg / direction / service / secteur /
// affect), en signalant ceux identifiés comme "responsable" du niveau via sa règle SQL.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') as EntityType | null
    const code = searchParams.get('code')

    if (!type || !code || !(type in ENTITY_BUSINESS_LEVEL)) {
      return NextResponse.json({ error: 'Paramètres type et code requis' }, { status: 400 })
    }

    const [agents, level] = await Promise.all([
      getAgentsForNode(type, code),
      prisma.hierarchyLevel.findUnique({ where: { level: ENTITY_BUSINESS_LEVEL[type] } })
    ])

    const { agents: responsables } = await resolveResponsablesForNode(level, type, code)
    const responsableIds = new Set(responsables.map(r => r.id))

    return NextResponse.json({
      agents: agents.map(a => ({
        id: a.id,
        matricule: a.matricule,
        nom: a.nom,
        prenom: a.prenom,
        poste_l: a.poste_l,
        fonction_l: a.fonction_l,
        mail: a.mail,
        est_responsable: responsableIds.has(a.id)
      })),
      count: agents.length
    })
  } catch (error) {
    console.error('Hierarchy Agents Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
