import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { authenticateApiRequest } from '@/lib/api-auth'

/**
 * Recherche multi-résultats d'agents RefAgent par nom/prénom/matricule
 * (contains), pour une saisie prédictive (autocomplete) — contrairement à
 * /api/agents/presence qui ne renvoie qu'UN meilleur candidat (adapté à un
 * rapprochement, pas à une liste de suggestions au fil de la frappe).
 * Utilisée par le formulaire de demande "Arrivée d'agent" côté DSI Hub pour
 * rechercher l'agent arrivé et son N+1/manager (tous deux doivent résoudre
 * à un RefAgent existant, requis par Onboarding.agent_id / manager_id).
 */
export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (apiKey) {
      const authResult = await authenticateApiRequest(req, 'read')
      if (!authResult.authorized) return NextResponse.json({ error: authResult.error }, { status: 401 })
    } else {
      const session = await getServerSession(authOptions)
      if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    if (q.length < 2) return NextResponse.json({ data: [] })

    const agents = await prisma.refAgent.findMany({
      where: {
        OR: [
          { nom: { contains: q, mode: 'insensitive' } },
          { prenom: { contains: q, mode: 'insensitive' } },
          { matricule: { contains: q, mode: 'insensitive' } },
        ],
        actif: true,
      },
      take: 10,
      orderBy: { nom: 'asc' },
    })

    return NextResponse.json({
      data: agents.map((a) => ({
        id: a.id,
        nom: a.nom,
        prenom: a.prenom,
        email: a.mail,
        matricule: a.matricule,
        service: a.nom_service,
        direction: a.nom_direction,
        fonction: a.fonction_l || a.poste_l,
      })),
    })
  } catch (error: any) {
    console.error('[API-AGENTS-SEARCH-ERROR]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
