import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 })
    }

    // 1. Trouver le manager via le token de l'un de ses dossiers
    const startOnboarding = await prisma.onboarding.findUnique({
      where: { token_dashboard: token },
      select: { manager_id: true }
    })

    if (!startOnboarding || !startOnboarding.manager_id) {
        // Essayer aussi via token_formulaire au cas où
        const altOnboarding = await prisma.onboarding.findUnique({
            where: { token_formulaire: token },
            select: { manager_id: true }
        })
        if (!altOnboarding || !altOnboarding.manager_id) {
            return NextResponse.json({ error: 'Jeton invalide ou expiré' }, { status: 404 })
        }
        startOnboarding.manager_id = altOnboarding.manager_id
    }

    // 2. Récupérer tous les dossiers de ce manager
    const onboardings = await prisma.onboarding.findMany({
      where: { manager_id: startOnboarding.manager_id },
      include: {
        agent: true,
        tasks: true,
        manager: {
          select: { nom: true, prenom: true, id: true }
        }
      },
      orderBy: { date_arrivee_prevue: 'asc' }
    })

    return NextResponse.json(onboardings)

  } catch (error: any) {
    console.error('[ONBOARDING-MANAGER-API-ERROR]', error)
    return NextResponse.json({ error: 'Internal error', details: error.message }, { status: 500 })
  }
}
