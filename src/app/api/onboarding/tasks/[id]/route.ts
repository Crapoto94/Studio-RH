import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: idParam } = await params
    const id = parseInt(idParam)
    const body = await req.json()

    // On peut mettre à jour soit le statut (done), soit le commentaire, soit les deux
    const updated = await prisma.onboardingTask.update({
      where: { id },
      data: {
        done: body.hasOwnProperty('done') ? body.done : undefined,
        commentaire: body.commentaire !== undefined ? body.commentaire : undefined,
        date_completion: body.done === true ? new Date() : (body.done === false ? null : undefined)
      }
    })

    // Vérifier si toutes les tâches sont terminées pour cet onboarding
    const allTasks = await prisma.onboardingTask.findMany({
      where: { onboarding_id: updated.onboarding_id }
    })
    
    const allDone = allTasks.every(t => t.done)
    if (allDone) {
      await (prisma.onboarding as any).update({
        where: { id: updated.onboarding_id },
        data: { statut: 'termine' }
      })
    } else {
      // Si on décoche une tâche alors que c'était terminé, on repasse en cours
      await (prisma.onboarding as any).update({
        where: { id: updated.onboarding_id },
        data: { statut: 'en_cours_realisation' }
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('API Onboarding Task PATCH Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
