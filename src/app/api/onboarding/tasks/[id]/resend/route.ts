import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendEmailWithTemplate } from '@/lib/api-ville'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { id: idParam } = await params
    const taskId = parseInt(idParam)
    const task = await (prisma as any).onboardingTask.findUnique({
      where: { id: taskId },
      include: { 
        onboarding: {
          include: { agent: true }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Tâche introuvable' }, { status: 404 })
    }

    if (!task.responsable_mail) {
      return NextResponse.json({ error: 'Aucun responsable mail défini pour cette tâche' }, { status: 400 })
    }

    const onboarding = task.onboarding
    const agentName = onboarding.agent ? `${onboarding.agent.prenom} ${onboarding.agent.nom}` : `${onboarding.prenom_temp} ${onboarding.nom_temp}`
    
    // Récupérer le message paramétré
    const mailParam = await prisma.parametre.findUnique({ where: { cle: 'MAIL_MSG_WORKFLOW' } })
    const bodyTemplate = mailParam?.valeur || "Bonjour, une tâche logistique ({{TASK_TITRE}}) vous a été assignée pour {{AGENT_NOM}}. Merci de l'acquitter ici : {{ACK_URL}}"

    const publicUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const ackUrl = `${publicUrl}/onboarding/task/acknowledge?token=${task.task_token}`

    const success = await sendEmailWithTemplate({
      to: task.responsable_mail,
      subject: `[Rappel] 📋 Tâche Onboarding : ${task.titre} (${agentName})`,
      body: bodyTemplate,
      onboarding_id: onboarding.id,
      variables: {
        AGENT_NOM: agentName,
        TASK_NAME: task.titre,
        VAL_URL: `${publicUrl}/onboarding/task/acknowledge?token=${task.task_token}`
      }
    })

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'email' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('API Task Resend Error:', error)
    return NextResponse.json({ error: 'Internal error', details: error.message }, { status: 500 })
  }
}
