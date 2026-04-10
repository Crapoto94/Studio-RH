import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, prismaLocal } from '@/lib/db'
import { randomUUID } from 'crypto'
import { notifyManager } from '@/lib/onboarding'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('mode')

    const params = await prismaLocal.parametre.findMany({ where: { cle: 'RH_FUTUR_DAYS' } })
    const futurDays = parseInt(params[0]?.valeur || '30')
    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() + futurDays)

    if (mode === 'futurs') {
      const onboarded = await prisma.onboarding.findMany({ where: { NOT: { agent_id: null } }, select: { agent_id: true } })
      const onboardedIds = onboarded.map(o => o.agent_id as number).filter(Boolean)
      const futurs = await prisma.refAgent.findMany({
        where: { id: { notIn: onboardedIds }, date_arrivee: { gte: new Date(), lte: thresholdDate } },
        orderBy: { date_arrivee: 'asc' }
      })
      return NextResponse.json(futurs)
    }

    // Auto-detection of new agents coming soon
    const activeOnboardings = await prisma.onboarding.findMany({ where: { NOT: { agent_id: null } }, select: { agent_id: true } })
    const excludedIds = activeOnboardings.map(o => o.agent_id as number).filter(Boolean)
    const detected = await prisma.refAgent.findMany({
      where: { id: { notIn: excludedIds }, date_arrivee: { gte: new Date(), lte: thresholdDate } }
    })

    for (const fAgent of detected) {
      await prisma.onboarding.create({
        data: {
          agent_id: fAgent.id,
          statut: 'a_faire',
          date_arrivee_prevue: fAgent.date_arrivee,
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
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await req.json()
    const { agent_id, manager_id, date_arrivee_prevue, nom_temp, prenom_temp, direction_temp, service_temp, poste_temp } = body

    if (!manager_id) return NextResponse.json({ error: 'Manager obligatoire' }, { status: 400 })

    const onboarding = await prisma.onboarding.create({
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
        date_arrivee_prevue: date_arrivee_prevue ? new Date(date_arrivee_prevue) : null
      }
    })

    await notifyManager(onboarding, manager_id, req.nextUrl.origin)
    return NextResponse.json(onboarding)
  } catch (error: any) {
    console.error('API Onboarding POST Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
