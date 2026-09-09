import { prisma, prismaLocal } from '@/lib/db'
import { sendEmailWithTemplate } from '@/lib/api-ville'
import { generateOnboardingPDF } from './pdf'
import { randomUUID } from 'crypto'

// Durée de validité du lien public d'acquittement de tâche (task_token),
// envoyé par mail sans authentification — cf. OnboardingTask.token_created_at.
export const TASK_TOKEN_VALIDITY_DAYS = 30

export function isTaskTokenExpired(tokenCreatedAt: Date | string | null | undefined): boolean {
  if (!tokenCreatedAt) return false
  const issued = new Date(tokenCreatedAt).getTime()
  const limit = issued + TASK_TOKEN_VALIDITY_DAYS * 24 * 60 * 60 * 1000
  return Date.now() > limit
}

/**
 * Pousse une tâche d'onboarding vers AppDSI, rattachée au ticket qui a
 * déclenché cet onboarding (Onboarding.dsihub_ticket_id). Renvoie l'id de la
 * tâche DSI Hub créée (à stocker dans OnboardingTask.dsihub_task_id pour
 * permettre le rappel d'acquittement automatique), ou null si l'appel
 * échoue — best effort, ne doit jamais faire échouer la génération des
 * tâches d'onboarding.
 *
 * groupId affecte la tâche à un groupe technicien DSI Hub précis (choisi
 * lors du paramétrage du workflow, item.dsihubGroupId) — omis pour les
 * tâches générées automatiquement (ex. création de compte logiciel) qui
 * doivent seulement être visibles dans le ticket, sans affectation. Dans ce
 * cas le champ group_id est absent du payload (plutôt qu'envoyé à null) :
 * beaucoup de validateurs REST (class-validator @IsOptional, etc.)
 * acceptent un champ absent mais rejettent un null explicite sur un champ
 * numérique.
 */
export async function pushTaskToDsihub(params: {
  dsihubTicketId: number
  groupId?: number | null
  description: string
  rhStudioTaskId: number
}): Promise<number | null> {
  try {
    const urlParam = await prismaLocal.parametre.findUnique({ where: { cle: 'DSIHUB_API_URL' } })
    const keyParam = await prismaLocal.parametre.findUnique({ where: { cle: 'DSIHUB_API_KEY' } })
    const baseUrl = urlParam?.valeur || 'http://10.103.130.106:3001/api'
    const apiKey = keyParam?.valeur
    if (!apiKey) {
      console.error('[ONBOARDING-DSIHUB-PUSH] DSIHUB_API_KEY non configurée (/parametres)')
      return null
    }

    const payload: Record<string, any> = {
      ticket_id: params.dsihubTicketId,
      description: params.description,
      rh_studio_task_id: params.rhStudioTaskId,
    }
    if (params.groupId !== undefined && params.groupId !== null) {
      payload.group_id = params.groupId
    }

    const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/tasks/external/rh-studio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const detail = `Statut ${res.status} — ${JSON.stringify(data)} — payload envoyé : ${JSON.stringify(payload)}`
      console.error('[ONBOARDING-DSIHUB-PUSH] échec', detail)
      // Traçable en base (pas seulement dans les logs serveur, pas toujours
      // accessibles) : cf. échec réel constaté en prod le 09/09/2026 sur une
      // tâche logicielle sans group_id, jamais remontée dans le ticket.
      await prisma.audit.create({
        data: {
          action: 'ONBOARDING_DSIHUB_PUSH_FAILED',
          target: `Onboarding task RH Studio ID: ${params.rhStudioTaskId}`,
          details: detail,
        }
      }).catch(() => {})
      return null
    }
    return data.id ?? null
  } catch (e: any) {
    console.error('[ONBOARDING-DSIHUB-PUSH-ERROR]', e.message)
    await prisma.audit.create({
      data: {
        action: 'ONBOARDING_DSIHUB_PUSH_FAILED',
        target: `Onboarding task RH Studio ID: ${params.rhStudioTaskId}`,
        details: `Exception : ${e.message}`,
      }
    }).catch(() => {})
    return null
  }
}

/**
 * Signale à AppDSI que le manager a rempli le formulaire d'arrivée : le
 * ticket "Arrivée d'agent" (En attente depuis sa création, cf.
 * triggerOnboardingRhStudio côté AppDSI) passe "En cours". Best effort, comme
 * pushTaskToDsihub ci-dessus — ne doit jamais faire échouer la soumission du
 * formulaire manager.
 */
export async function markDsihubTicketInProgress(dsihubTicketId: number): Promise<void> {
  try {
    const urlParam = await prismaLocal.parametre.findUnique({ where: { cle: 'DSIHUB_API_URL' } })
    const keyParam = await prismaLocal.parametre.findUnique({ where: { cle: 'DSIHUB_API_KEY' } })
    const baseUrl = urlParam?.valeur || 'http://10.103.130.106:3001/api'
    const apiKey = keyParam?.valeur
    if (!apiKey) {
      console.error('[ONBOARDING-DSIHUB-STATUS] DSIHUB_API_KEY non configurée (/parametres)')
      return
    }
    const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/tasks/external/rh-studio/onboarding-started`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ ticket_id: dsihubTicketId }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      console.error('[ONBOARDING-DSIHUB-STATUS] échec', res.status, data)
    }
  } catch (e: any) {
    console.error('[ONBOARDING-DSIHUB-STATUS-ERROR]', e.message)
  }
}

/**
 * Signale à AppDSI qu'une tâche DSI Hub a été (dés)acquittée côté Studio-RH
 * (dashboard interne), pour que la tâche miroir dans DSI Hub reflète le même
 * état — pendant du callback inverse (AppDSI -> PATCH /api/onboarding/tasks/
 * [id] avec x-api-key) qui acquitte ici quand c'est fait côté DSI Hub. Best
 * effort, ne doit jamais faire échouer l'acquittement local.
 *
 * Contrat côté AppDSI (confirmé) :
 *   PATCH {DSIHUB_API_URL}/tasks/external/rh-studio/task-completed
 *   { dsihub_task_id, done, commentaire }
 */
export async function notifyDsihubTaskCompleted(params: {
  dsihubTaskId: number
  done: boolean
  commentaire?: string | null
}): Promise<void> {
  try {
    const urlParam = await prismaLocal.parametre.findUnique({ where: { cle: 'DSIHUB_API_URL' } })
    const keyParam = await prismaLocal.parametre.findUnique({ where: { cle: 'DSIHUB_API_KEY' } })
    const baseUrl = urlParam?.valeur || 'http://10.103.130.106:3001/api'
    const apiKey = keyParam?.valeur
    if (!apiKey) {
      console.error('[ONBOARDING-DSIHUB-TASK-SYNC] DSIHUB_API_KEY non configurée (/parametres)')
      return
    }
    const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/tasks/external/rh-studio/task-completed`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        dsihub_task_id: params.dsihubTaskId,
        done: params.done,
        commentaire: params.commentaire || null,
      }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      console.error('[ONBOARDING-DSIHUB-TASK-SYNC] échec', res.status, data)
    }
  } catch (e: any) {
    console.error('[ONBOARDING-DSIHUB-TASK-SYNC-ERROR]', e.message)
  }
}

/**
 * Invitation initiale au manager pour remplir le formulaire
 */
export async function notifyManager(onboarding: any, managerId: number, origin: string) {
  try {
    const manager = await prisma.refAgent.findUnique({ where: { id: managerId } })
    const managerEmail = manager?.mail || manager?.azure_id

    if (!managerEmail) {
       console.warn(`[ONBOARDING-NOTIFY] Manager ${managerId} sans email.`);
       return false;
    }

    const agentLabel = onboarding.nom_temp ? `${onboarding.prenom_temp} ${onboarding.nom_temp}` : 'Nouvel arrivant'
    
    // Récupérer l'URL de base configurée
    const appUrlParam = await prismaLocal.parametre.findUnique({ where: { cle: 'APP_BASE_URL' } })
    const publicUrl = appUrlParam?.valeur || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || origin
    
    const link = `${publicUrl}/onboarding/form?token=${onboarding.token_formulaire}`

    const mailParam = await prismaLocal.parametre.findUnique({ where: { cle: 'MAIL_MSG_MANAGER' } })
    const bodyTemplate = mailParam?.valeur || "Bonjour {{MANAGER_NOM}}, merci de compléter le formulaire pour {{AGENT_NOM}} : {{FORM_URL}}"

    return await sendEmailWithTemplate({
      to: managerEmail,
      subject: `📦 Nouvel arrivant : Formulaire à remplir (${agentLabel})`,
      body: bodyTemplate,
      onboarding_id: onboarding.id,
      variables: {
        AGENT_NOM: agentLabel,
        MANAGER_NOM: manager ? `${manager.prenom} ${manager.nom}` : "Manager",
        FORM_URL: link
      }
    })
  } catch (e: any) {
    console.error('[ONBOARDING-NOTIFY-ERROR]', e.message)
    return false;
  }
}

/**
 * Confirmation de réception après soumission du formulaire
 */
export async function notifyManagerSubmission(onboardingId: number, origin: string) {
    try {
        let onboarding = await (prisma.onboarding as any).findUnique({
            where: { id: onboardingId },
            include: { manager: true, agent: true }
        });

        if (!onboarding || !onboarding.manager_id) return false;

        // Générer le token de dashboard s'il n'existe pas
        if (!onboarding.token_dashboard) {
            onboarding = await (prisma.onboarding as any).update({
                where: { id: onboardingId },
                data: { token_dashboard: randomUUID() },
                include: { manager: true, agent: true }
            });
        }

        const managerEmail = onboarding.manager?.mail || onboarding.manager?.azure_id;
        if (!managerEmail) return false;

        const agentLabel = onboarding.agent 
            ? `${onboarding.agent.prenom} ${onboarding.agent.nom}` 
            : `${onboarding.prenom_temp} ${onboarding.nom_temp}`;

        // Récupérer l'URL de base configurée
        const appUrlParam = await prismaLocal.parametre.findUnique({ where: { cle: 'APP_BASE_URL' } });
        const publicUrl = appUrlParam?.valeur || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || origin;
        
        const dashUrl = `${publicUrl}/onboarding/manager?token=${onboarding.token_dashboard}`;

        const mailParam = await prismaLocal.parametre.findUnique({ where: { cle: 'MAIL_MSG_MANAGER_SUBMISSION' } });
        const bodyTemplate = mailParam?.valeur || "Bonjour {{MANAGER_NOM}}, le formulaire pour {{AGENT_NOM}} a été bien reçu. Vous pouvez télécharger le récapitulatif ici : {{RECAP_URL}} . Suivez l'avancement ici : {{DASH_URL}}";

        return await sendEmailWithTemplate({
            to: managerEmail,
            subject: `✅ Formulaire reçu : ${agentLabel}`,
            body: bodyTemplate,
            onboarding_id: onboardingId,
            variables: {
                AGENT_NOM: agentLabel,
                MANAGER_NOM: onboarding.manager ? `${onboarding.manager.prenom} ${onboarding.manager.nom}` : "Manager",
                DASH_URL: dashUrl,
                RECAP_URL: `${publicUrl}/api/onboarding/${onboardingId}/pdf?token=${onboarding.token_dashboard}`
            }
        });
    } catch (e: any) {
        console.error('[ONBOARDING-NOTIFY-SUBMISSION-ERROR]', e.message);
        return false;
    }
}

/**
 * Notification finale quand tout est terminé
 */
export async function notifyManagerCompletion(onboardingId: number, origin: string) {
    try {
        const onboarding = await (prisma.onboarding as any).findUnique({
            where: { id: onboardingId },
            include: { manager: true, agent: true }
        });

        if (!onboarding || !onboarding.manager_id || onboarding.statut !== 'termine') return false;

        const managerEmail = onboarding.manager?.mail || onboarding.manager?.azure_id;
        if (!managerEmail) return false;

        const agentLabel = onboarding.agent 
            ? `${onboarding.agent.prenom} ${onboarding.agent.nom}` 
            : `${onboarding.prenom_temp} ${onboarding.nom_temp}`;

        // Récupérer l'URL de base configurée
        const appUrlParam = await prismaLocal.parametre.findUnique({ where: { cle: 'APP_BASE_URL' } });
        const publicUrl = appUrlParam?.valeur || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || origin;
        
        const dashUrl = `${publicUrl}/onboarding/manager?token=${onboarding.token_dashboard}`;

        const mailParam = await prismaLocal.parametre.findUnique({ where: { cle: 'MAIL_MSG_MANAGER_COMPLETE' } });
        const bodyTemplate = mailParam?.valeur || "Bonjour {{MANAGER_NOM}}, l'onboarding de {{AGENT_NOM}} est terminé ! Tout est prêt.";

        return await sendEmailWithTemplate({
            to: managerEmail,
            subject: `🎉 Onboarding terminé : ${agentLabel}`,
            body: bodyTemplate,
            onboarding_id: onboardingId,
            variables: {
                AGENT_NOM: agentLabel,
                MANAGER_NOM: onboarding.manager ? `${onboarding.manager.prenom} ${onboarding.manager.nom}` : "Manager",
                DASH_URL: dashUrl
            }
        });
    } catch (e: any) {
        console.error('[ONBOARDING-NOTIFY-COMPLETION-ERROR]', e.message);
        return false;
    }
}
