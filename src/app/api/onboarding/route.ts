import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { randomUUID } from 'crypto'
import { sendEmailWithTemplate } from '@/lib/api-ville'

// GET: Liste les onboardings et les futurs agents non encore traités
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('mode') // 'active' ou 'futurs'

    // 1. Récupération des seuils et config
    const params = await prisma.parametre.findMany({
      where: { cle: { in: ['RH_FUTUR_DAYS'] } }
    })
    const config = Object.fromEntries(params.map(p => [p.cle, p.valeur]))
    const futurDays = parseInt(config['RH_FUTUR_DAYS'] || '30')
    
    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() + futurDays)

    if (mode === 'futurs') {
      try {
        // Liste uniquement les futurs agents non traités (lecture seule)
        const onboarded = await (prisma.onboarding as any).findMany({
          where: { NOT: { agent_id: null } },
          select: { agent_id: true }
        })
        const onboardedAgentIds = onboarded.map((o: any) => o.agent_id).filter(Boolean)

        const futurs = await (prisma.refAgent as any).findMany({
          where: {
            id: { notIn: onboardedAgentIds },
            date_arrivee: {
              gte: new Date(),
              lte: thresholdDate
            }
          },
          orderBy: { date_arrivee: 'asc' }
        })

        return NextResponse.json(Array.isArray(futurs) ? futurs : [])
      } catch (err) {
        console.error("Error fetching futurs agents:", err)
        return NextResponse.json([])
      }
    }

    // --- PHASE DE SYNCHRONISATION AUTOMATIQUE ---
    // On cherche les agents qui arrivent bientôt et qui n'ont pas de dossier Onboarding
    try {
        const alreadyInOnboarding = await (prisma.onboarding as any).findMany({
            where: { NOT: { agent_id: null } },
            select: { agent_id: true }
        })
        const excludedIds = alreadyInOnboarding.map((o: any) => o.agent_id).filter(Boolean)

        const nowIso = new Date().toISOString()
        const thresholdIso = thresholdDate.toISOString()

        const detectedFutureAgents = await (prisma.refAgent as any).findMany({
            where: {
                id: { notIn: excludedIds },
                date_arrivee: {
                    gte: nowIso,
                    lte: thresholdIso
                }
            }
        })

        if (detectedFutureAgents.length > 0) {
            console.log(`[ONBOARDING-SYNC] ${detectedFutureAgents.length} agents futurs détectés pour auto-onboarding.`);
            for (const fAgent of detectedFutureAgents) {
                // Création automatique
                await (prisma.onboarding as any).create({
                    data: {
                        agent_id: fAgent.id,
                        manager_id: null,
                        statut: 'a_faire',
                        date_arrivee_prevue: fAgent.date_arrivee ? new Date(fAgent.date_arrivee) : null,
                        nom_temp: fAgent.nom,
                        prenom_temp: fAgent.prenom
                    }
                })
                console.log(`[ONBOARDING-SYNC] Dossier créé pour ${fAgent.prenom} ${fAgent.nom}`);
            }
        }
    } catch (syncErr: any) {
        console.error("[ONBOARDING-SYNC-ERROR] Échec de la synchro auto:", syncErr.message);
    }

    // Par défaut: Retourne les Onboardings actifs (Kanban)
    const onboardings = await prisma.onboarding.findMany({
      include: {
        tasks: true,
      },
      orderBy: { updated_at: 'desc' }
    })

    // On va aussi chercher les détails de l'agent si agent_id est présent
    // Note: On le fait manuellement ici car Prism ne connait peut être pas la relation si pas définie en explicit
    const enriched = await Promise.all(onboardings.map(async (o) => {
      let agent = null
      let manager = null
      if (o.agent_id) {
        agent = await prisma.refAgent.findUnique({ where: { id: o.agent_id } })
      }
      if (o.manager_id) {
        manager = await prisma.refAgent.findUnique({ where: { id: o.manager_id } })
      }
      return { ...o, agent, manager }
    }))

    return NextResponse.json(enriched)

  } catch (error) {
    console.error('API Onboarding Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// POST: Initialise un onboarding
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const body = await req.json()
    const { agent_id, manager_id, date_arrivee_prevue, nom_temp, prenom_temp, direction_temp, service_temp, poste_temp } = body

    if (!manager_id) {
      return NextResponse.json({ error: 'Le manager est obligatoire' }, { status: 400 })
    }

    // Génération d'un token sécurisé pour le manager
    const token = randomUUID()

    const onboarding = await (prisma.onboarding as any).create({
      data: {
        agent_id: agent_id || null,
        manager_id,
        nom_temp: nom_temp || null,
        prenom_temp: prenom_temp || null,
        direction_temp: direction_temp || null,
        service_temp: service_temp || null,
        poste_temp: poste_temp || null,
        statut: 'en_cours_demande',
        token_formulaire: token,
        date_arrivee_prevue: date_arrivee_prevue ? new Date(date_arrivee_prevue) : null
      }
    })

    // Notification du manager
    try {
      const manager = await prisma.refAgent.findUnique({ where: { id: manager_id } })
      
      const managerEmail = manager?.mail || manager?.azure_id
      if (!managerEmail) {
        return NextResponse.json({ error: "Impossible de notifier le manager : aucune adresse e-mail existante dans la base RH ou Entra ID." }, { status: 400 })
      }

      const agentLabel = nom_temp ? `${prenom_temp} ${nom_temp}` : 'Nouvel arrivant'
      
      if (manager && managerEmail) {
        const publicUrl = req.nextUrl.origin
        const link = `${publicUrl}/onboarding/form?token=${token}`
        
        console.log(`[ONBOARDING-POST-DEBUG] Tentative envoi mail manager: ${manager.mail}`);
        console.log(`[ONBOARDING-POST-DEBUG] Link: ${link}`);

        // Retrieve Manager Message Template
        const mailParam = await prisma.parametre.findUnique({ where: { cle: 'MAIL_MSG_MANAGER' } })
        const bodyTemplate = mailParam?.valeur || "Bonjour {{MANAGER_NOM}}, merci de compléter le formulaire pour {{AGENT_NOM}} : {{FORM_URL}}"

        try {
          const success = await sendEmailWithTemplate({
            to: managerEmail,
            subject: `📦 Nouvel arrivant : Formulaire à remplir (${agentLabel})`,
            body: bodyTemplate,
            onboarding_id: (onboarding as any).id,
            variables: {
              AGENT_NOM: agentLabel,
              MANAGER_NOM: (manager as any).prenom + ' ' + (manager as any).nom,
              FORM_URL: link
            }
          })
          console.log(`[ONBOARDING-POST-DEBUG] Résultat sendEmailWithTemplate: ${success}`);
        } catch (sendErr: any) {
          console.error(`[ONBOARDING-POST-CRITICAL] Échec envoi email manager:`, sendErr.message);
        }
      } else {
        console.warn(`[ONBOARDING-POST-WARN] Manager introuvable ou sans email (ID: ${manager_id})`);
      }
    } catch (e: any) {
      console.error('[ONBOARDING-POST-ERROR] Internal Manager Notify Error:', e.message)
    }

    // Audit Log (console uniquement - SynchroLog n'existe pas dans le schéma Prisma)
    console.log(`[ONBOARDING-AUDIT] Initialisation onboarding #${(onboarding as any).id} pour ${agent_id ? 'Agent ID:'+agent_id : prenom_temp+' '+nom_temp}. Manager ID: ${manager_id}`)

    return NextResponse.json(onboarding)
  } catch (error: any) {
    const fs = require('fs')
    const logMsg = `\n[${new Date().toISOString()}] POST ERROR: ${error.message}\n${error.stack}\n`
    fs.appendFileSync('c:\\dev\\RH Studio NEW\\debug_api.log', logMsg)
    
    console.error('API Onboarding POST Error:', error)
    return NextResponse.json({ 
      error: 'Internal error', 
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
