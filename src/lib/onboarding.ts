import { prisma } from '@/lib/db'
import { sendEmailWithTemplate } from '@/lib/api-ville'

export async function notifyManager(onboarding: any, managerId: number, origin: string) {
  try {
    const manager = await prisma.refAgent.findUnique({ where: { id: managerId } })
    const managerEmail = manager?.mail || manager?.azure_id

    if (!managerEmail) {
       console.warn(`[ONBOARDING-NOTIFY] Manager ${managerId} sans email.`);
       return false;
    }

    const agentLabel = onboarding.nom_temp ? `${onboarding.prenom_temp} ${onboarding.nom_temp}` : 'Nouvel arrivant'
    // Priorité absolue à la variable d'environnement définie par l'admin
    const publicUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || origin
    const link = `${publicUrl}/onboarding/form?token=${onboarding.token_formulaire}`

    const mailParam = await prisma.parametre.findUnique({ where: { cle: 'MAIL_MSG_MANAGER' } })
    const bodyTemplate = mailParam?.valeur || "Bonjour {{MANAGER_NOM}}, merci de compléter le formulaire pour {{AGENT_NOM}} : {{FORM_URL}}"

    return await sendEmailWithTemplate({
      to: managerEmail,
      subject: `📦 Nouvel arrivant : Formulaire à remplir (${agentLabel})`,
      body: bodyTemplate,
      onboarding_id: onboarding.id,
      variables: {
        AGENT_NOM: agentLabel,
        MANAGER_NOM: `${manager.prenom} ${manager.nom}`,
        FORM_URL: link
      }
    })
  } catch (e: any) {
    console.error('[ONBOARDING-NOTIFY-ERROR]', e.message)
    return false;
  }
}
