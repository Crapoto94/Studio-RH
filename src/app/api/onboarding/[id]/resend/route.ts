import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notifyManager } from '@/lib/onboarding'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { id: idParam } = await params
    const onboardingId = parseInt(idParam)
    const onboarding = await (prisma.onboarding as any).findUnique({
      where: { id: onboardingId }
    })

    if (!onboarding) {
      return NextResponse.json({ error: 'Onboarding introuvable' }, { status: 404 })
    }

    if (!onboarding.manager_id) {
        return NextResponse.json({ error: 'Manager ID manquant pour cet onboarding' }, { status: 400 })
    }

    console.log(`[ONBOARDING-RESEND] Provoking resend for Onboarding ${onboardingId} to manager ${onboarding.manager_id}`);

    // Utiliser la fonction centralisée qui gère les URLs et les templates
    const success = await notifyManager(onboarding, onboarding.manager_id, req.nextUrl.origin)

    if (success) {
        return NextResponse.json({ success: true })
    } else {
        return NextResponse.json({ error: 'Erreur lors de l\'envoide l\'email (voir logs serveur)' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('API Onboarding Resend POST Error:', error)
    return NextResponse.json({ error: 'Internal error', message: error.message }, { status: 500 })
  }
}
