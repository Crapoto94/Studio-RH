import { NextRequest, NextResponse } from 'next/server'
import { prisma, prismaLocal } from '@/lib/db'
import { randomUUID } from 'crypto'
import { sendEmailWithTemplate } from '@/lib/api-ville'
import { notifyManagerSubmission, pushTaskToDsihub, markDsihubTicketInProgress } from '@/lib/onboarding'

// GET: Récupère les infos pour le formulaire manager via son token
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 })
    }

    console.log(`[ONBOARDING-PUBLIC-DEBUG] Recherche Token: ${token}`);

    // Recherche du dossier Onboarding
    const onboarding = await (prisma.onboarding as any).findFirst({
      where: { token_formulaire: token }
    })

    if (!onboarding) {
      console.warn(`[ONBOARDING-PUBLIC-WARN] Token non trouvé: ${token}`);
      return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 404 })
    }

    // Récupérer les infos de l'agent si agent_id est présent (Bypass include)
    let agent = null
    if (onboarding.agent_id) {
      agent = await prisma.refAgent.findUnique({
        where: { id: onboarding.agent_id }
      }) as any
      // Enrichir avec le site de travail géographique depuis BRUT_RH
      if (agent?.matricule) {
        const brutRhRecord = await prisma.brutRh.findFirst({
          where: { MATRICULE: agent.matricule },
          select: { AFFECTGEO_L: true }
        })
        if (brutRhRecord?.AFFECTGEO_L) {
          agent = { ...agent, affectgeo_l: brutRhRecord.AFFECTGEO_L }
        }
      }
    }

    // Récupérer la configuration
    const configs = await prismaLocal.parametre.findMany({
      where: {
        cle: { in: ['ONBOARDING_FORM_CONFIG', 'ONBOARDING_LISTS_CONFIG', 'ONBOARDING_SOFTWARE_CONFIG'] }
      }
    })
    
    // Extraction sécurisée
    const configForm = configs.find(c => c.cle === 'ONBOARDING_FORM_CONFIG')?.valeur || '[]';
    const configListsRaw = configs.find(c => c.cle === 'ONBOARDING_LISTS_CONFIG')?.valeur;
    const configSoftwareRaw = configs.find(c => c.cle === 'ONBOARDING_SOFTWARE_CONFIG')?.valeur;
    
    let lists: any = {}
    try {
      if (configListsRaw) {
        lists = JSON.parse(configListsRaw)
      }
    } catch (e) {
      console.error('[ONBOARDING-PUBLIC-ERROR] JSON Parse Lists failed', e)
    }

    // ── LISTE DYNAMIQUE DES LOGICIELS DE DSIHUB (MagApp) ───────────────────────
    let dsihubError = null
    try {
      const dsihubParam = configs.find(c => c.cle === 'DSIHUB_API_URL')
      const dsihubBaseUrl = dsihubParam?.valeur || 'http://10.103.130.106:3001/api'
      const dsihubEndpoint = `${dsihubBaseUrl}/magapp/apps`

      console.log(`[ONBOARDING-PUBLIC] Fetching dynamic software list from: ${dsihubEndpoint}`)
      
      // Désactiver la vérification TLS pour le réseau local
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
      
      const dsihubRes = await fetch(dsihubEndpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 300 } // Cache de 5 minutes
      })

      if (!dsihubRes.ok) {
        throw new Error(`DSIHub a répondu avec le statut ${dsihubRes.status}`)
      }

      const dsihubApps = await dsihubRes.json()
      if (Array.isArray(dsihubApps)) {
        const dsihubBaseUrlClean = dsihubBaseUrl.replace(/\/api\/?$/, '')
        
        const filtered = dsihubApps
          .filter(app => app.email_createur && app.email_createur.trim() !== '')
          .map(app => ({ 
            nom: app.name, 
            description: app.description || '',
            icon: app.icon ? `${dsihubBaseUrlClean}${app.icon}` : null
          }))
          .sort((a, b) => a.nom.localeCompare(b.nom))
        
        lists.LIST_LOGICIELS_METIERS = filtered
      } else {
        throw new Error("Format de réponse DSIHub invalide (attendu: tableau)")
      }
    } catch (e: any) {
      console.error('[ONBOARDING-PUBLIC-ERROR] DSIHub fetch failed:', e.message)
      dsihubError = `Impossible de récupérer la liste des logiciels : ${e.message}`
      lists.LIST_LOGICIELS_METIERS = [] // Liste vide en cas d'erreur
    }

    // LISTE DYNAMIQUE DES DIRECTIONS & SERVICES
    try {
      const agents = await prisma.refAgent.findMany({
        select: { nom_direction: true, nom_service: true },
        where: { 
            AND: [
                { nom_direction: { not: null } },
                { nom_direction: { not: '' } }
            ]
        }
      })
      
      const dynamicDirections = new Set<string>()
      const dictServices: Record<string, Set<string>> = {}

      agents.forEach(a => {
        if (!a.nom_direction) return
        dynamicDirections.add(a.nom_direction)
        
        if (!dictServices[a.nom_direction]) dictServices[a.nom_direction] = new Set()
        if (a.nom_service) dictServices[a.nom_direction].add(a.nom_service)
      })
      
      const sortedDirections = Array.from(dynamicDirections).sort((a,b) => a.localeCompare(b))
      if (sortedDirections.length > 0) {
        lists.LIST_DIRECTIONS = sortedDirections
      }

      // Convert Sets to sorted Arrays for the frontend
      const finalDictServices: Record<string, string[]> = {}
      Object.keys(dictServices).forEach(dir => {
        finalDictServices[dir] = Array.from(dictServices[dir]).sort((a,b) => a.localeCompare(b))
      })
      lists.dictServices = finalDictServices

      // Fetch dynamic LIST_SITES from BRUT_RH
      try {
        const sitesRaw = await prisma.brutRh.findMany({
          select: { AFFECTGEO_L: true },
          where: { 
            AND: [
              { AFFECTGEO_L: { not: null } },
              { AFFECTGEO_L: { not: '' } }
            ]
          },
          distinct: ['AFFECTGEO_L']
        })
        const finalSites = Array.from(new Set(sitesRaw.map(s => s.AFFECTGEO_L?.trim()).filter(Boolean) as string[])).sort((a,b) => a.localeCompare(b))
        if (finalSites.length > 0) {
          lists.LIST_SITES = finalSites
        }
      } catch (err) {
        console.warn('Failed to fetch LIST_SITES from BrutRh', err)
      }

    } catch (err) {
      console.error('[ONBOARDING-PUBLIC-ERROR] Fetching dynamic hierarchy failed', err)
    }

    return NextResponse.json({
      onboarding: { ...onboarding, agent },
      config: configForm,
      lists: lists,
      dsihubError: dsihubError
    })

  } catch (error: any) {
    console.error('[ONBOARDING-PUBLIC-CRITICAL-ERROR] GET:', error)
    return NextResponse.json({ 
      error: 'Internal error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 })
  }
}

// POST: Soumission du formulaire par le manager
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { onboardingId, responses, action } = body

    if (!onboardingId) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const id = parseInt(onboardingId)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    // Gestion de l'annulation
    if (action === 'cancel') {
        const onboarding = await (prisma.onboarding as any).update({
            where: { id: id },
            data: { statut: 'annule' },
            include: { agent: true }
        })
        
        await prisma.audit.create({
            data: {
              action: 'ONBOARDING_CANCEL_MANAGER',
              target: `Onboarding ID: ${id}`,
              details: `Le manager a refusé l'onboarding pour ${onboarding.agent ? onboarding.agent.nom : onboarding.nom_temp}.`
            }
        }).catch(() => {})
        
        return NextResponse.json({ success: true, cancelled: true })
    }
    
    // ... suite (responses obligatoires pour la validation standard)
    if (!responses) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    console.log(`[ONBOARDING-PUBLIC-DEBUG] Soumission Onboarding ID: ${id}`);

    // 1. Mise à jour de l'onboarding
    const onboarding = await (prisma.onboarding as any).update({
      where: { id: id },
      data: {
        reponses_formulaire: JSON.stringify(responses),
        statut: 'en_cours_realisation',
        // Synchronisation des corrections d'identité et de structure
        nom_temp: responses.nom_agent || undefined,
        prenom_temp: responses.prenom_agent || undefined,
        direction_temp: responses.direction || undefined,
        service_temp: responses.service || undefined,
        poste_temp: responses.intitule_poste || undefined,
      },
      include: { agent: true }
    })

    // 1bis. Le ticket AppDSI "Arrivée d'agent" (En attente depuis sa création
    // côté AppDSI) passe "En cours" — le manager a fait sa part, la hot-line
    // peut traiter la suite. Best effort, ne bloque jamais la soumission.
    if (onboarding.dsihub_ticket_id) {
      markDsihubTicketInProgress(onboarding.dsihub_ticket_id).catch(() => {})
    }

    // 2. Génération des tâches via Workflow
    const configParam = await prismaLocal.parametre.findUnique({
      where: { cle: 'ONBOARDING_WORKFLOW_CONFIG' }
    })
    
    if (configParam && configParam.valeur) {
      try {
        const workflow = JSON.parse(configParam.valeur) 
        if (Array.isArray(workflow)) {
          // Récupérer l'URL de base configurée
          const appUrlParam = await prismaLocal.parametre.findUnique({ where: { cle: 'APP_BASE_URL' } })
          const publicUrl = appUrlParam?.valeur || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || req.nextUrl.origin
          
          const agentName = onboarding.agent 
            ? `${onboarding.agent.prenom} ${onboarding.agent.nom}` 
            : `${onboarding.prenom_temp} ${onboarding.nom_temp}`

          const mailParam = await prismaLocal.parametre.findUnique({ where: { cle: 'MAIL_MSG_WORKFLOW' } })
          const bodyTemplate = mailParam?.valeur || "Bonjour, une tâche a été générée : {{TASK_NAME}} pour {{AGENT_NOM}}. Cliquez ici : {{ACKNOWLEDGE_URL}}"

          for (const item of workflow) {
            const taskToken = randomUUID()
            const taskName = item.task || item.label || item.titre || 'Tâche'
            // 'dsihub' : tâche affectée à un groupe DSI Hub (pas d'email, pas
            // de lien d'acquittement public — acquittement automatique quand
            // la tâche DSI Hub miroir est terminée, cf. pushTaskToDsihub).
            // 'email' (défaut, comportement historique) : tâche autonome,
            // notifiée par email avec lien d'acquittement public.
            const recipientType = item.recipientType === 'dsihub' ? 'dsihub' : 'email'

            const createdTask = await (prisma.onboardingTask as any).create({
              data: {
                onboarding_id: onboarding.id,
                titre: taskName,
                responsable_mail: recipientType === 'email' ? (item.email || null) : null,
                delay_days: parseInt(item.delay || '0') || 0,
                task_token: taskToken,
                done: false,
                recipient_type: recipientType,
                dsihub_group_id: recipientType === 'dsihub' ? (item.dsihubGroupId || null) : null,
              }
            })

            if (recipientType === 'email') {
              if (item.email) {
                await sendEmailWithTemplate({
                  to: item.email,
                  subject: `📦 Nouvelle tâche Onboarding : ${taskName}`,
                  body: bodyTemplate,
                  onboarding_id: onboarding.id,
                  variables: {
                    AGENT_NOM: agentName,
                    TASK_NAME: taskName,
                    VAL_URL: `${publicUrl}/onboarding/task/acknowledge?token=${taskToken}`
                  }
                }).catch(e => console.error(`[ONBOARDING-PUBLIC-ERROR] Mail fail to ${item.email}`, e))
              }
            } else if (item.dsihubGroupId && onboarding.dsihub_ticket_id) {
              const dsihubTaskId = await pushTaskToDsihub({
                dsihubTicketId: onboarding.dsihub_ticket_id,
                groupId: item.dsihubGroupId,
                description: taskName,
                rhStudioTaskId: createdTask.id,
              })
              if (dsihubTaskId) {
                await (prisma.onboardingTask as any).update({
                  where: { id: createdTask.id },
                  data: { dsihub_task_id: dsihubTaskId }
                })
              }
            } else if (recipientType === 'dsihub') {
              console.warn(`[ONBOARDING-PUBLIC] Tâche "${taskName}" marquée DSI Hub mais groupe ou ticket manquant (onboarding #${onboarding.id}) — non poussée.`)
            }
          }
        }
      } catch (e) {
        console.error('[ONBOARDING-PUBLIC-ERROR] Workflow execution failed', e)
      }
    }

    // 3. Tâches dynamiques par logiciel (via DSIHub / MagApp) ──────────────────
    const appUrlParam2 = await prismaLocal.parametre.findUnique({ where: { cle: 'APP_BASE_URL' } })
    const publicUrl = appUrlParam2?.valeur || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || req.nextUrl.origin

    if (Array.isArray(responses.logiciels_metiers) && responses.logiciels_metiers.length > 0) {
        try {
            const dsihubParam = await prismaLocal.parametre.findUnique({ where: { cle: 'DSIHUB_API_URL' } })
            const dsihubBaseUrl = dsihubParam?.valeur || 'http://10.103.130.106:3001/api'
            const dsihubEndpoint = `${dsihubBaseUrl}/magapp/apps`
            
            console.log(`[ONBOARDING-PUBLIC-POST] Fetching creator emails from: ${dsihubEndpoint}`)

            // Désactiver la vérification TLS pour le réseau local
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

            const dsihubRes = await fetch(dsihubEndpoint, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            })

            if (!dsihubRes.ok) throw new Error(`DSIHub inaccessible (Statut ${dsihubRes.status})`)
            
            const dsihubApps = await dsihubRes.json()
            const selectedSoftwareNames = responses.logiciels_metiers as string[]
            
            const mailParam = await prismaLocal.parametre.findUnique({ where: { cle: 'MAIL_MSG_WORKFLOW' } })
            const bodyTemplate = mailParam?.valeur || "Bonjour, une tâche a été générée : {{TASK_NAME}} pour {{AGENT_NOM}}. Cliquez ici : {{ACKNOWLEDGE_URL}}"
            const agentName = onboarding.agent 
                ? `${onboarding.agent.prenom} ${onboarding.agent.nom}` 
                : `${onboarding.prenom_temp} ${onboarding.nom_temp}`

            for (const swName of selectedSoftwareNames) {
                const sw = Array.isArray(dsihubApps) ? dsihubApps.find((app: any) => app.name === swName) : null
                if (sw && sw.email_createur) {
                    const taskToken = randomUUID()
                    const taskTitle = `Création de compte logiciel : ${sw.name}`
                    
                    await (prisma.onboardingTask as any).create({
                        data: {
                            onboarding_id: onboarding.id,
                            titre: taskTitle,
                            responsable_mail: sw.email_createur,
                            delay_days: 0,
                            task_token: taskToken,
                            done: false
                        }
                    })

                    await sendEmailWithTemplate({
                        to: sw.email_createur,
                        subject: `📦 Accès Logiciel : ${sw.name} (${agentName})`,
                        body: bodyTemplate,
                        onboarding_id: onboarding.id,
                        variables: {
                            AGENT_NOM: agentName,
                            TASK_NAME: taskTitle,
                            VAL_URL: `${publicUrl}/onboarding/task/acknowledge?token=${taskToken}`
                        }
                    }).catch(e => console.error(`[ONBOARDING-PUBLIC-ERROR] Mail fail to ${sw.email_createur} for ${sw.name}`, e))
                }
            }
        } catch (e: any) {
            console.error('[ONBOARDING-PUBLIC-ERROR] Software dynamic tasks (DSIHub) failed:', e.message)
        }
    }

    // 4. Audit
    await prisma.audit.create({
      data: {
        action: 'ONBOARDING_SUBMIT_MANAGER',
        target: `Onboarding ID: ${id}`,
        details: `Soumission manager ok pour ${onboarding.nom_temp || 'agent'}`
      }
    }).catch(() => {})

    // 5. Notification de confirmation au manager
    await notifyManagerSubmission(onboarding.id, req.nextUrl.origin).catch(e => console.error('[ONBOARDING-SUBMISSION-NOTIFY-FAILED]', e));

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[ONBOARDING-PUBLIC-CRITICAL-ERROR] POST:', error)
    return NextResponse.json({ error: 'Internal error', details: error.message }, { status: 500 })
  }
}
