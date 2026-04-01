import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const search = searchParams.get('search')

    if (!token || !search) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Vérifier que le token d'onboarding est valide
    const onboarding = await (prisma.onboarding as any).findFirst({
      where: { token_formulaire: token }
    })

    if (!onboarding) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 403 })
    }

    // Recherche d'agents
    const agents = await prisma.refAgent.findMany({
      where: {
        OR: [
          { nom: { contains: search } },
          { prenom: { contains: search } },
          { matricule: { contains: search } }
        ],
        actif: true
      },
      take: 10,
      orderBy: { nom: 'asc' }
    })

    return NextResponse.json({ data: agents })
  } catch (error: any) {
    console.error('[API-ONBOARDING-SEARCH-AGENTS-ERROR]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
