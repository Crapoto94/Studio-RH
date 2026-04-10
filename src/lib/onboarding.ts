import { prisma, prismaLocal } from '@/lib/db'
import { sendEmailWithTemplate } from '@/lib/api-ville'
import { generateOnboardingPDF } from './pdf'
import { randomUUID } from 'crypto'

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
