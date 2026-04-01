import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Récupère les infos de la tâche via son token
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) return NextResponse.json({ error: 'Token manquant' }, { status: 400 })

    const task = await prisma.onboardingTask.findUnique({
      where: { task_token: token },
      include: {
        onboarding: {
          select: {
             nom_temp: true,
             prenom_temp: true,
             agent: { select: { nom: true, prenom: true } }
          }
        }
      }
    })

    if (!task) return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 })

    return NextResponse.json({
      titre: task.titre,
      agent_nom: task.onboarding.agent?.nom || task.onboarding.nom_temp,
      agent_prenom: task.onboarding.agent?.prenom || task.onboarding.prenom_temp,
      done: task.done
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, commentaire } = body

    if (!token) {
      return NextResponse.json({ error: 'Jeton manquant' }, { status: 400 })
    }

    // 1. Trouver la tâche par son token
    const task = await prisma.onboardingTask.findUnique({
      where: { task_token: token },
      include: { onboarding: true }
    })

    if (!task) {
      return NextResponse.json({ error: 'Tâche non trouvée ou jeton invalide' }, { status: 404 })
    }

    if (task.done) {
      return NextResponse.json({ error: 'Cette tâche a déjà été validée' }, { status: 400 })
    }

    // 2. Mettre à jour la tâche
    const updatedTask = await prisma.onboardingTask.update({
      where: { id: task.id },
      data: {
        done: true,
        commentaire: commentaire || null,
        date_completion: new Date()
      }
    })

    // 3. Vérifier si toutes les tâches de cet onboarding sont terminées
    const allTasks = await prisma.onboardingTask.findMany({
      where: { onboarding_id: task.onboarding_id }
    })

    const allDone = allTasks.every(t => t.done)
    if (allDone) {
      await (prisma.onboarding as any).update({
        where: { id: task.onboarding_id },
        data: { statut: 'termine' }
      })
    }

    // 4. Log d'audit (optionnel)
    try {
        await prisma.audit.create({
          data: {
            action: 'TASK_ACKNOWLEDGE',
            target: `Task ID: ${task.id}`,
            details: `Tâche "${task.titre}" acquittée par lien externe. Commentaire: ${commentaire || 'Aucun'}`
          }
        })
    } catch (e) {
        console.warn('Audit log failed (ignoring):', e)
    }

    return NextResponse.json({ success: true, task: updatedTask })

  } catch (error: any) {
    console.error('API Task Acknowledge Error:', error)
    return NextResponse.json({ error: 'Internal error', details: error.message }, { status: 500 })
  }
}
