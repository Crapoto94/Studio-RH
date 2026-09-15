import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { resolveNPlus1, NPlus1Step } from '@/lib/responsable'

// Résout le N+1 (responsable direct, au sens des règles SQL configurées par niveau) d'un agent.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const agentId = Number(searchParams.get('agentId'))
    if (!agentId) return NextResponse.json({ error: 'agentId requis' }, { status: 400 })

    const agent = await prisma.refAgent.findUnique({ where: { id: agentId } })
    if (!agent) return NextResponse.json({ error: 'Agent introuvable' }, { status: 404 })

    const trace: NPlus1Step[] = []
    const result = await resolveNPlus1(agent, trace)

    return NextResponse.json({
      agent: {
        id: agent.id,
        nom: agent.nom,
        prenom: agent.prenom,
        matricule: agent.matricule,
        poste_l: agent.poste_l,
        nom_direction: agent.nom_direction,
        nom_service: agent.nom_service,
      },
      nPlus1: result ? {
        id: result.responsable.id,
        nom: result.responsable.nom,
        prenom: result.responsable.prenom,
        matricule: result.responsable.matricule,
        poste_l: result.responsable.poste_l,
        mail: result.responsable.mail,
        nom_direction: result.responsable.nom_direction,
        nom_service: result.responsable.nom_service,
        resolvedAt: result.resolvedAt,
      } : null,
      trace
    })
  } catch (error) {
    console.error('N+1 Resolution Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
