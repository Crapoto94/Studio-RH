import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateApiRequest } from '@/lib/api-auth'

/**
 * Liste complète des agents RH actifs (clé API x-api-key, permission "read").
 * Utilisée par le proxy ASTECH Explorer pour calculer les non-concordances :
 *  - agents RH actifs absents d'ASTECH (« à créer ») ;
 *  - confrontation des matricules ASTECH ↔ RH (« à désactiver » / concordants).
 *
 * Contrairement à /api/agents (réservé à la session web) et /api/agents/search
 * (limité à une recherche par nom/matricule, 10 résultats), cette route renvoie
 * l'intégralité du référentiel actif en une seule requête.
 */
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authResult = await authenticateApiRequest(req, 'read')
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  try {
    const now = new Date()
    const agents = await prisma.refAgent.findMany({
      where: {
        actif: true,
        OR: [
          { date_depart: null, plus_vu: null },
          { date_depart: { gt: now } },
        ],
      },
      select: {
        id: true,
        matricule: true,
        nom: true,
        prenom: true,
        mail: true,
        nom_service: true,
        nom_direction: true,
        actif: true,
        date_arrivee: true,
        date_depart: true,
        plus_vu: true,
        fonction_l: true,
        poste_l: true,
      },
      orderBy: { nom: 'asc' },
    })

    return NextResponse.json({
      count: agents.length,
      data: agents.map((a) => ({
        id: a.id,
        matricule: a.matricule,
        nom: a.nom,
        prenom: a.prenom,
        email: a.mail,
        service: a.nom_service,
        direction: a.nom_direction,
        fonction: a.fonction_l || a.poste_l,
        actif: a.actif,
        date_arrivee: a.date_arrivee,
        date_depart: a.date_depart,
        plus_vu: a.plus_vu,
      })),
    })
  } catch (error) {
    console.error('[API-AGENTS-LIST-ERROR]', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
