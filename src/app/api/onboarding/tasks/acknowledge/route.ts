import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { notifyManagerCompletion, isTaskTokenExpired, notifyDsihubTaskCompleted } from '@/lib/onboarding'

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

    // Une tâche déjà acquittée reste consultable même après expiration du
    // lien : on affiche simplement l'état (date/commentaire), sans permettre
    // de ré-acquitter. Seule une tâche encore en attente est bloquée par un
    // lien expiré (cf. POST ci-dessous).
    if (!task.done && isTaskTokenExpired(task.token_created_at)) {
      return NextResponse.json({ error: 'Ce lien a expiré (validité 1 mois). Demandez un renvoi de la tâche.', expired: true }, { status: 410 })
    }

    return NextResponse.json({
      titre: task.titre,
      agent_nom: task.onboarding.agent?.nom || task.onboarding.nom_temp,
      agent_prenom: task.onboarding.agent?.prenom || task.onboarding.prenom_temp,
      done: task.done,
      commentaire: task.commentaire,
      date_completion: task.date_completion
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

    if (isTaskTokenExpired(task.token_created_at)) {
      return NextResponse.json({ error: 'Ce lien a expiré (validité 1 mois). Demandez un renvoi de la tâche.', expired: true }, { status: 410 })
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

    // 2bis. Tâche avec un miroir DSI Hub (ex. création de compte logiciel,
    // visible dans le ticket) : répercuter l'acquittement vers AppDSI, comme
    // pour l'acquittement depuis le dashboard interne (best effort).
    if (updatedTask.dsihub_task_id) {
      notifyDsihubTaskCompleted({
        dsihubTaskId: updatedTask.dsihub_task_id,
        done: true,
        commentaire: updatedTask.commentaire,
      }).catch(() => {})
    }

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

      // Déclenchement du mail de fin d'onboarding au manager
      await notifyManagerCompletion(task.onboarding_id, req.nextUrl.origin).catch(e => console.error('[ONBOARDING-COMPLETION-NOTIFY-FAILED]', e));
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
