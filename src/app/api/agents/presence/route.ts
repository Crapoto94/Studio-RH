import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { authenticateApiRequest } from '@/lib/api-auth'
import { z } from 'zod'
import { tokenize, matchNameTokens, NAME_MATCH_THRESHOLD } from '@/lib/nameMatch'

const querySchema = z.object({
  email: z.string().trim().optional(),
  q: z.string().trim().optional(),
  nom: z.string().trim().optional(),
  prenom: z.string().trim().optional(),
})

type Status = 'present' | 'departed' | 'not_yet_arrived'

const STATUS_LABELS: Record<Status, string> = {
  present: 'Présent',
  departed: 'Parti',
  not_yet_arrived: 'Pas encore présent',
}

function computeStatus(agent: { date_arrivee: Date | null; date_depart: Date | null; plus_vu: Date | null }, now: Date): Status {
  const departed = (agent.date_depart !== null && agent.date_depart <= now) ||
    (agent.date_depart === null && agent.plus_vu !== null)
  if (departed) return 'departed'
  if (agent.date_arrivee !== null && agent.date_arrivee > now) return 'not_yet_arrived'
  return 'present'
}

function toAgentSummary(agent: any, now: Date) {
  const status = computeStatus(agent, now)
  return {
    id: agent.id,
    nom: agent.nom,
    prenom: agent.prenom,
    email: agent.mail,
    matricule: agent.matricule,
    service: agent.nom_service,
    direction: agent.nom_direction,
    fonction: agent.fonction_l || agent.poste_l,
    present: status === 'present',
    status,
    statusLabel: STATUS_LABELS[status],
    ...(status === 'not_yet_arrived' ? { dateArriveePrevue: agent.date_arrivee } : {}),
    ...(status === 'departed' ? { dateDepart: agent.date_depart ?? agent.plus_vu } : {}),
  }
}

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (apiKey) {
      const authResult = await authenticateApiRequest(req, 'read')
      if (!authResult.authorized) {
        return NextResponse.json({ error: authResult.error }, { status: 401 })
      }
    } else {
      const session = await getServerSession(authOptions)
      if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))

    if (!query.email && !query.q && !query.nom && !query.prenom) {
      return NextResponse.json(
        { error: 'Paramètre requis: email, q, ou nom/prenom.' },
        { status: 400 }
      )
    }

    const now = new Date()
    const selectFields = {
      id: true,
      nom: true,
      prenom: true,
      mail: true,
      matricule: true,
      nom_service: true,
      nom_direction: true,
      fonction_l: true,
      poste_l: true,
      date_arrivee: true,
      date_depart: true,
      plus_vu: true,
      actif: true,
    }

    // --- Recherche par email ---
    if (query.email) {
      const emailNorm = query.email.toLowerCase()

      const exact = await prisma.refAgent.findFirst({
        where: { mail: { equals: emailNorm, mode: 'insensitive' } },
        select: selectFields,
      })
      if (exact) {
        return NextResponse.json({
          found: true,
          matchType: 'exact',
          score: 1,
          agent: toAgentSummary(exact, now),
        })
      }

      const partials = await prisma.refAgent.findMany({
        where: { mail: { contains: emailNorm, mode: 'insensitive' } },
        select: selectFields,
        take: 5,
      })
      if (partials.length === 1) {
        return NextResponse.json({
          found: true,
          matchType: 'approximate',
          score: 0.7,
          agent: toAgentSummary(partials[0], now),
        })
      }
      if (partials.length > 1) {
        return NextResponse.json({
          found: false,
          reason: 'ambiguous',
          candidates: partials.map(a => toAgentSummary(a, now)),
        })
      }

      return NextResponse.json({ found: false, reason: 'no_match' })
    }

    // --- Recherche par nom/prénom (tolérante) ---
    const queryTokens = [
      ...tokenize(query.q),
      ...tokenize(query.nom),
      ...tokenize(query.prenom),
    ]
    if (queryTokens.length === 0) {
      return NextResponse.json(
        { error: 'Paramètre requis: email, q, ou nom/prenom.' },
        { status: 400 }
      )
    }

    // Pré-filtre SQL large (insensible à la casse) pour limiter le volume chargé en mémoire,
    // puis scoring tolérant (accents, tirets, fautes de frappe, ordre) côté application.
    const candidates = await prisma.refAgent.findMany({
      where: {
        OR: queryTokens.flatMap(t => [
          { nom: { contains: t, mode: 'insensitive' as const } },
          { prenom: { contains: t, mode: 'insensitive' as const } },
        ]),
      },
      select: selectFields,
      take: 500,
    })

    const scored = candidates
      .map(agent => {
        const candidateTokens = [...tokenize(agent.nom), ...tokenize(agent.prenom)]
        const result = matchNameTokens(queryTokens, candidateTokens)
        return { agent, result }
      })
      .filter(({ result }) => result.finalScore >= NAME_MATCH_THRESHOLD)
      .sort((a, b) => b.result.finalScore - a.result.finalScore)

    if (scored.length === 0) {
      return NextResponse.json({ found: false, reason: 'no_match' })
    }

    const best = scored[0]
    const runnerUp = scored[1]

    // Ambiguïté: un deuxième candidat quasi aussi bon que le premier.
    if (runnerUp && (best.result.finalScore - runnerUp.result.finalScore) < 0.08) {
      return NextResponse.json({
        found: false,
        reason: 'ambiguous',
        candidates: scored.slice(0, 5).map(({ agent, result }) => ({
          ...toAgentSummary(agent, now),
          score: Math.round(result.finalScore * 100) / 100,
        })),
      })
    }

    return NextResponse.json({
      found: true,
      matchType: best.result.isExactSet ? 'exact' : 'approximate',
      score: Math.round(best.result.finalScore * 100) / 100,
      agent: toAgentSummary(best.agent, now),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Paramètres invalides', details: error.errors }, { status: 400 })
    }
    console.error('API Agents Presence GET Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
