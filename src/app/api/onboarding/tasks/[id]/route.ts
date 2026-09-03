import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notifyManagerCompletion } from '@/lib/onboarding'
import { authenticateApiRequest } from '@/lib/api-auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Clé API (permission read_write — AppDSI acquittant une tâche DSI Hub
    // terminée) OU session NextAuth.
    const apiKey = req.headers.get('x-api-key')
    if (apiKey) {
      const authResult = await authenticateApiRequest(req, 'read_write')
      if (!authResult.authorized) return NextResponse.json({ error: authResult.error }, { status: 401 })
    } else {
      const session = await getServerSession(authOptions)
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)
    const body = await req.json()

    // 1. Mettre à jour la tâche
    const updated = await prisma.onboardingTask.update({
      where: { id },
      data: {
        done: body.hasOwnProperty('done') ? body.done : undefined,
        commentaire: body.commentaire !== undefined ? body.commentaire : undefined,
        date_completion: body.done === true ? new Date() : (body.done === false ? null : undefined)
      }
    })

    // 2. Récupérer l'état actuel de l'onboarding pour détecter la transition
    const onboarding = await (prisma.onboarding as any).findUnique({
      where: { id: updated.onboarding_id },
      select: { statut: true }
    })

    // 3. Vérifier si toutes les tâches sont terminées pour cet onboarding
    const allTasks = await prisma.onboardingTask.findMany({
      where: { onboarding_id: updated.onboarding_id }
    })
    
    const allDone = allTasks.every(t => t.done)
    
    if (allDone) {
      if (onboarding?.statut !== 'termine') {
        await (prisma.onboarding as any).update({
          where: { id: updated.onboarding_id },
          data: { statut: 'termine' }
        })

        // Déclenchement du mail de fin d'onboarding au manager
        const origin = req.nextUrl.origin
        await notifyManagerCompletion(updated.onboarding_id, origin).catch(e => 
          console.error('[ONBOARDING-COMPLETION-NOTIFY-FAILED]', e)
        )
      }
    } else {
      // Si on décoche une tâche alors que c'était terminé, on repasse en cours
      if (onboarding?.statut === 'termine') {
        await (prisma.onboarding as any).update({
          where: { id: updated.onboarding_id },
          data: { statut: 'en_cours_realisation' }
        })
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('API Onboarding Task PATCH Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
