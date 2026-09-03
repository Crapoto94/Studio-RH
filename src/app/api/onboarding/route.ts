import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, prismaLocal } from '@/lib/db'
import { randomUUID } from 'crypto'
import { notifyManager } from '@/lib/onboarding'
import { authenticateApiRequest } from '@/lib/api-auth'

// Accepte soit une clé API (x-api-key, permission 'read'), soit une session
// NextAuth — même pattern que /api/agents/presence. Utilisé par AppDSI pour
// GET ?mode=futurs (liste des futurs agents, cf. formulaire de demande
// "Arrivée d'agent" côté DSI Hub).
async function checkReadAuth(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  if (apiKey) {
    const authResult = await authenticateApiRequest(req, 'read')
    return authResult.authorized ? null : NextResponse.json({ error: authResult.error }, { status: 401 })
  }
  const session = await getServerSession(authOptions)
  return session ? null : NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
}

export async function GET(req: NextRequest) {
  try {
    const authError = await checkReadAuth(req)
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('mode')

    const params = await prismaLocal.parametre.findMany({ where: { cle: 'RH_FUTUR_DAYS' } })
    const futurDays = parseInt(params[0]?.valeur || '30')
    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() + futurDays)

    // NB: on se base sur date_premiere_arrivee (vraie premiere arrivee dans la
    // collectivite, jamais reecrite ensuite) et non date_arrivee (debut du
    // contrat/poste courant, qui change a chaque renouvellement de contrat et
    // ferait sinon detecter a tort des agents deja en poste comme "nouveaux").
    if (mode === 'futurs') {
      const onboarded = await prisma.onboarding.findMany({ where: { NOT: { agent_id: null } }, select: { agent_id: true } })
      const onboardedIds = onboarded.map(o => o.agent_id as number).filter(Boolean)
      const futurs = await prisma.refAgent.findMany({
        where: { id: { notIn: onboardedIds }, date_premiere_arrivee: { gte: new Date(), lte: thresholdDate } },
        orderBy: { date_premiere_arrivee: 'asc' }
      })
      return NextResponse.json(futurs)
    }

    // Variante utilisée par AppDSI (formulaire de demande "Arrivée d'agent") :
    // 'futurs' exclut TOUT agent ayant ne serait-ce qu'un onboarding stub
    // auto-détecté (statut 'a_faire', jamais réellement lancé par un manager,
    // cf. auto-détection ci-dessous) — ce qui vide la liste au fil du temps
    // sans qu'aucun onboarding n'ait été réellement traité. 'futurs_actionable'
    // n'exclut que les agents dont l'onboarding a réellement démarré
    // (statut != 'a_faire') : un stub 'a_faire' reste proposable, et POST
    // /api/onboarding le complète au lieu d'en recréer un doublon (cf. plus bas).
    //
    // Un agent devient "actionnable" de deux façons :
    //  (a) il a déjà un stub 'a_faire' (peu importe sa date d'arrivée, même
    //      dépassée — cas "MANAGER MANQUANT" jamais résolu : ces stubs restent
    //      "à faire" indéfiniment tant qu'un manager n'est pas renseigné, donc
    //      les exclure sous prétexte que la date est passée les rendait
    //      invisibles à la fois du dashboard "à traiter" ET du picker AppDSI) ;
    //  (b) pas encore de stub, mais arrivée prévue dans la fenêtre RH_FUTUR_DAYS.
    if (mode === 'futurs_actionable') {
      const stubs = await prisma.onboarding.findMany({
        where: { statut: 'a_faire', NOT: { agent_id: null } },
        include: { agent: true }
      })
      const stubAgents = stubs.map(s => s.agent).filter((a): a is NonNullable<typeof a> => !!a)
      const stubIds = stubAgents.map(a => a.id)

      const started = await prisma.onboarding.findMany({ where: { NOT: { agent_id: null }, statut: { not: 'a_faire' } }, select: { agent_id: true } })
      const startedIds = started.map(o => o.agent_id as number).filter(Boolean)

      const notYetStubbed = await prisma.refAgent.findMany({
        where: { id: { notIn: [...startedIds, ...stubIds] }, date_premiere_arrivee: { gte: new Date(), lte: thresholdDate } },
        orderBy: { date_premiere_arrivee: 'asc' }
      })

      const futurs = [...stubAgents, ...notYetStubbed].sort((a, b) => {
        const da = a.date_premiere_arrivee ? new Date(a.date_premiere_arrivee).getTime() : 0
        const db = b.date_premiere_arrivee ? new Date(b.date_premiere_arrivee).getTime() : 0
        return da - db
      })
      return NextResponse.json(futurs)
    }

    // Auto-detection of new agents coming soon
    const activeOnboardings = await prisma.onboarding.findMany({ where: { NOT: { agent_id: null } }, select: { agent_id: true } })
    const excludedIds = activeOnboardings.map(o => o.agent_id as number).filter(Boolean)
    const detected = await prisma.refAgent.findMany({
      where: { id: { notIn: excludedIds }, date_premiere_arrivee: { gte: new Date(), lte: thresholdDate } }
    })

    for (const fAgent of detected) {
      await prisma.onboarding.create({
        data: {
          agent_id: fAgent.id,
          statut: 'a_faire',
          date_arrivee_prevue: fAgent.date_premiere_arrivee,
          nom_temp: fAgent.nom,
          prenom_temp: fAgent.prenom
        }
      })
    }

    const onboardings = await prisma.onboarding.findMany({
      include: { tasks: true, agent: true, manager: true },
      orderBy: { updated_at: 'desc' }
    })
    return NextResponse.json(onboardings)
  } catch (error: any) {
    console.error('API Onboarding GET Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Clé API (permission read_write, ex. AppDSI) OU session NextAuth.
    const apiKey = req.headers.get('x-api-key')
    if (apiKey) {
      const authResult = await authenticateApiRequest(req, 'read_write')
      if (!authResult.authorized) return NextResponse.json({ error: authResult.error }, { status: 401 })
    } else {
      const session = await getServerSession(authOptions)
      if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const raw = body || {}
    const { nom_temp, prenom_temp, direction_temp, service_temp, poste_temp, date_arrivee_prevue } = raw
    // Coercion défensive : un appelant JSON peut envoyer ces id en string
    // (ex. AppDSI, dont l'id ticket vient d'un BIGINT Postgres renvoyé en
    // string par node-postgres) alors que Prisma attend un vrai number pour
    // ces colonnes Int — sinon PrismaClientValidationError silencieuse en 500
    // "Internal error" (constaté sur dsihub_ticket_id, cf. ticket AppDSI #44965).
    const toIntOrNull = (v: any) => (v === undefined || v === null || v === '' ? null : Number(v))
    const agent_id = toIntOrNull(raw.agent_id)
    const manager_id = toIntOrNull(raw.manager_id)
    const dsihub_ticket_id = toIntOrNull(raw.dsihub_ticket_id)

    if (!manager_id || Number.isNaN(manager_id)) return NextResponse.json({ error: 'Manager obligatoire' }, { status: 400 })
    if (agent_id !== null && Number.isNaN(agent_id)) return NextResponse.json({ error: 'agent_id invalide' }, { status: 400 })

    // Si cet agent a déjà un onboarding "stub" (statut 'a_faire', créé par
    // l'auto-détection GET /api/onboarding sans mode, jamais réellement lancé
    // par un manager), on le complète au lieu d'en créer un doublon — cf.
    // mode=futurs_actionable ci-dessus, qui propose ces stubs comme
    // sélectionnables côté AppDSI.
    const existingStub = agent_id
      ? await prisma.onboarding.findFirst({ where: { agent_id, statut: 'a_faire' } })
      : null

    const onboarding = existingStub
      ? await prisma.onboarding.update({
          where: { id: existingStub.id },
          data: {
            manager_id,
            direction_temp,
            service_temp,
            poste_temp,
            statut: 'en_cours_demande',
            token_formulaire: randomUUID(),
            date_arrivee_prevue: date_arrivee_prevue ? new Date(date_arrivee_prevue) : existingStub.date_arrivee_prevue,
            dsihub_ticket_id: dsihub_ticket_id || existingStub.dsihub_ticket_id
          }
        })
      : await prisma.onboarding.create({
          data: {
            agent_id: agent_id || null,
            manager_id,
            nom_temp,
            prenom_temp,
            direction_temp,
            service_temp,
            poste_temp,
            statut: 'en_cours_demande',
            token_formulaire: randomUUID(),
            date_arrivee_prevue: date_arrivee_prevue ? new Date(date_arrivee_prevue) : null,
            dsihub_ticket_id: dsihub_ticket_id || null
          }
        })

    await notifyManager(onboarding, manager_id, req.nextUrl.origin)
    return NextResponse.json(onboarding)
  } catch (error: any) {
    console.error('API Onboarding POST Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
