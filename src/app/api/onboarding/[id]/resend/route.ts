import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendEmailWithTemplate } from '@/lib/api-ville'
import { randomUUID } from 'crypto'

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

    // Lookup agent manuellement (bypass include Prisma)
    let agent = onboarding.agent_id ? await prisma.refAgent.findUnique({ where: { id: onboarding.agent_id } }) : null

    if (!onboarding.manager_id) {
        console.log(`[ONBOARDING-RESEND-DEBUG] Manager ID manquant pour Onboarding ${onboardingId}. Recherche alternative...`);
    }

    let manager = onboarding.manager_id ? await prisma.refAgent.findUnique({ where: { id: onboarding.manager_id } }) : null
    
    if (!manager) {
        console.log(`[ONBOARDING-RESEND-DEBUG] Manager non trouvé par ID. Recherche par nom...`);
    }

    if (!manager || !manager.mail) {
        const err = !manager ? 'Manager introuvable' : 'Email du manager non renseigné';
        console.error(`[ONBOARDING-RESEND-ERROR] ${err} pour Onboarding ${onboardingId}`);
        return NextResponse.json({ error: err }, { status: 400 })
    }

    // Récupérer le message paramétré
    const mailParam = await prisma.parametre.findUnique({ where: { cle: 'MAIL_MSG_MANAGER' } })
    const bodyTemplate = mailParam?.valeur || "Bonjour {{MANAGER_NOM}}, merci de compléter le formulaire pour {{AGENT_NOM}} : {{FORM_URL}}"

    const agentName = agent ? `${agent.prenom} ${agent.nom}` : `${onboarding.prenom_temp} ${onboarding.nom_temp}`
    
    // S'assurer qu'un token existe
    let token = onboarding.token_formulaire
    if (!token) {
        token = randomUUID()
        await (prisma.onboarding as any).update({
            where: { id: onboardingId },
            data: { token_formulaire: token }
        })
    }

    const publicUrl = new URL(req.url).origin

    console.log(`[ONBOARDING-RESEND-DEBUG] Envoi mail manager pour Onboarding ${onboardingId}`);
    console.log(`[ONBOARDING-RESEND-DEBUG] To: ${manager.mail}`);
    console.log(`[ONBOARDING-RESEND-DEBUG] Link: ${publicUrl}/onboarding/form?token=${token}`);

    try {
      const success = await sendEmailWithTemplate({
        to: manager.mail,
        subject: `[Rappel] 📦 Nouvel arrivant : Formulaire à remplir (${agentName})`,
        body: bodyTemplate,
        onboarding_id: onboarding.id,
        variables: {
          AGENT_NOM: agentName,
          MANAGER_NOM: manager.prenom + ' ' + manager.nom,
          FORM_URL: `${publicUrl}/onboarding/form?token=${token}`
        }
      })

      if (success) {
        console.log(`[ONBOARDING-RESEND-DEBUG] Succès appel sendEmailWithTemplate`);
        return NextResponse.json({ success: true })
      } else {
        console.error(`[ONBOARDING-RESEND-ERROR] Échec appel sendEmailWithTemplate (retour false)`);
        return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'email (voir logs serveur)' }, { status: 500 })
      }
    } catch (sendError: any) {
      console.error(`[ONBOARDING-RESEND-CRITICAL] Exception durant l'envoi:`, sendError.message);
      return NextResponse.json({ error: `Exception: ${sendError.message}` }, { status: 500 })
    }

  } catch (error) {
    console.error('API Onboarding Resend POST Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
