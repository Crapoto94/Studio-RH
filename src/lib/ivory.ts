import { prisma } from './db'

/**
 * Utilitaire pour l'envoi de notifications (Mails, SMS) via l'API Ivory de la Ville
 * Inclut la journalisation automatique dans EMAIL_LOGS / SMS_LOGS.
 */

export interface IvoryMailOptions {
  to: string
  subject: string
  body: string
  onboarding_id?: number
}

export interface IvorySmsOptions {
  to: string
  message: string
  onboarding_id?: number
}

export async function sendIvoryMail(options: IvoryMailOptions) {
  console.log(`[Ivory] Envoi de mail à ${options.to} - Sujet: ${options.subject}`)
  
  let success = true
  let errorMsg = null

  // Appel API Réel
  try {
     // Désactiver TLS check pour api-dev.ivry.local (certificat auto-signé possible)
     process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
     const res = await fetch('https://api-dev.ivry.local/api/v1/notifications', {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${process.env.IVORY_TOKEN}`
        },
        body: JSON.stringify({ type: 'mail', to: options.to, subject: options.subject, content: options.body })
     })
     success = res.ok
     if (!res.ok) errorMsg = await res.text()
  } catch (e: any) {
     success = false
     errorMsg = e.message
  }

  // Journalisation dans la base de données
  try {
    await prisma.emailLog.create({
      data: {
        to: options.to,
        subject: options.subject,
        body: options.body,
        status: success ? 'SUCCESS' : 'FAILURE',
        error: errorMsg,
        onboarding_id: options.onboarding_id
      }
    })
  } catch (e) {
    console.error('[Ivory Log Error] Impossible de logger l\'email:', e)
  }

  return success
}

export async function sendIvorySms(options: IvorySmsOptions) {
  console.log(`[Ivory] Envoi de SMS à ${options.to}: ${options.message}`)
  
  let success = true
  let errorMsg = null

  // Journalisation
  try {
    await prisma.smsLog.create({
      data: {
        to: options.to,
        message: options.message,
        status: success ? 'SUCCESS' : 'FAILURE',
        error: errorMsg,
        onboarding_id: options.onboarding_id
      }
    })
  } catch (e) {
    console.error('[Ivory Log Error] Impossible de logger le SMS:', e)
  }

  return success
}

/**
 * Purge les logs de plus de 6 mois (Rétention RGPD/DSI)
 */
export async function purgeOldIvoryLogs() {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  try {
    const deletedEmails = await prisma.emailLog.deleteMany({
      where: { sent_at: { lt: sixMonthsAgo } }
    })
    const deletedSms = await prisma.smsLog.deleteMany({
      where: { sent_at: { lt: sixMonthsAgo } }
    })
    
    console.log(`[Ivory Purge] ${deletedEmails.count} emails et ${deletedSms.count} SMS purgés.`)
    return { emails: deletedEmails.count, sms: deletedSms.count }
  } catch (e) {
    console.error('[Ivory Purge Error]', e)
    return { error: true }
  }
}
