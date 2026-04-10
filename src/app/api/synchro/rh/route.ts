import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    // Autentication check: allowing session OR Internal Secret (for Cron)
    const authHeader = req.headers.get('Authorization')
    const isInternal = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`

    if (!isInternal) {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any)?.role !== 'admin') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }
    }

    // 1. Log beginning
    const log = await prisma.synchroLog.create({
      data: {
        type: 'rh',
        statut: 'en_cours',
        message: 'Début de la consolidation (Agents + Hiérarchie)...'
      }
    })

    const updateProgress = async (prog: number, msg: string) => {
      await prisma.synchroLog.update({ 
        where: { id: log.id }, 
        data: { progress: prog, message: msg } 
      })
    }

    await updateProgress(5, 'Chargement des données brutes...')

    // 2. Fetch all BRUT data and Config
    const brutRhRecords = await prisma.brutRh.findMany()
    const brutHierRecords = await prisma.brutHierarchie.findMany()
    
    const params = await prisma.parametre.findMany()
    const config = Object.fromEntries(params.map(p => [p.cle, p.valeur]))
    const activePositions = (config['RH_POSITIONS_ACTIVES'] || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)

    const stats = { agents: { updated: 0, created: 0, left: 0 }, hier: { updated: 0, created: 0 }, matched_ad: 0, matched_azure: 0 }
    const modifiedAgentsSet = new Set<string>()

    await updateProgress(10, 'Indexation des données...')

    // Fetch existing agents to determine creations, updates, and departures
    const existingRefAgents = await prisma.refAgent.findMany()
    const refAgentMap = new Map(existingRefAgents.map(a => [a.matricule, a]))
    const currentBatchMatricules = new Set<string>()

    await updateProgress(15, `Traitement de ${brutRhRecords.length} agents...`)

    // 3. Process each BRUT_RH record -> REF_AGENTS
    let count = 0
    for (const brut of (brutRhRecords as any[])) {
      if (!brut.MATRICULE) continue
      const matStrRaw = String(brut.MATRICULE).trim()
      currentBatchMatricules.add(matStrRaw)
      count++

      // Les liens AD/Azure sont gérés manuellement. On récupère uniquement Mail/Mobile depuis HR (Ciril)
      const email = brut.EMAIL_PRO || null
      const mobile = brut.MOBILE_PRO || brut.TELEPHONE_PRO || null

      // Active status based on POSITION_L (Case insensitive and trimmed)
      const currentPos = (brut.POSITION_L || '').trim().toLowerCase()
      const isActif = activePositions.length === 0 || activePositions.includes(currentPos)

      const existingAgent = refAgentMap.get(matStrRaw) as any

      // Calcul des stats (Nouveaux, Modifiés, Partis)
      if (!existingAgent) {
         stats.agents.created++
      } else {
         const wasActif = existingAgent.actif
         if (wasActif === true && isActif === false) {
            stats.agents.left++
         }
      }

      // Use native Prisma upsert to be fully compatible with SQLite and Postgres
      try {
        const agentData = {
          nom: brut.NOM || 'Inconnu',
          prenom: brut.PRENOM || 'Inconnu',
          position_l: brut.POSITION_L,
          code_affect: brut.AFFECT,
          nom_affect_l: brut.AFFECT_L,
          code_service: brut.SERVICE,
          nom_service: brut.SERVICE_L,
          code_direction: brut.DIRECTION,
          nom_direction: brut.DIRECTION_L,
          code_dg_cab: brut.DG_CAB,
          nom_dg_cab_l: brut.DG_CAB_L || '',
          fonction_l: brut.FONCTION_L || '',
          poste_l: brut.POSTE_L || '',
          date_arrivee: brut.DATE_ARRIVEE ? new Date(brut.DATE_ARRIVEE) : null,
          date_depart: brut.DATE_DEPART ? new Date(brut.DATE_DEPART) : null,
          plus_vu: null,
          mail: email,
          mobile: mobile,
          actif: isActif,
          // note: ad_id and azure_id are NOT in the update data to preserve manual links
        }
        
        // DÉTECTION DES CHANGEMENTS (LOGS)
        if (existingAgent) {
          const fieldsToMonitor = [
            'nom', 'prenom', 'position_l', 'code_affect', 'nom_affect_l', 
            'code_service', 'nom_service', 'code_direction', 'nom_direction', 
            'code_dg_cab', 'nom_dg_cab_l', 'fonction_l', 'poste_l', 
            'mail', 'mobile', 'actif'
          ]

          for (const field of fieldsToMonitor) {
            let oldVal = String(existingAgent[field] || '')
            let newVal = String((agentData as any)[field] || '')

            // Spécial pour les dates si ajoutées plus tard
            if (existingAgent[field] instanceof Date) oldVal = existingAgent[field].toISOString()
            if ((agentData as any)[field] instanceof Date) newVal = (agentData as any)[field].toISOString()

            if (oldVal !== newVal) {
              modifiedAgentsSet.add(matStrRaw)
              await (prisma.syncAgentLog as any).create({
                data: {
                  synchro_id: log.id,
                  matricule: matStrRaw,
                  agent_nom: `${agentData.nom} ${agentData.prenom}`,
                  field: field,
                  old_value: oldVal,
                  new_value: newVal
                }
              })
            }
          }
        }

        await prisma.refAgent.upsert({
          where: { matricule: matStrRaw },
          create: {
             matricule: matStrRaw,
             ...agentData
          },
          update: agentData
        })
      } catch (err) {
        console.error(`Error upserting agent ${matStrRaw}:`, err)
      }

      if (count % 100 === 0) {
        const pct = 15 + Math.floor((count / brutRhRecords.length) * 70)
        await updateProgress(pct, `Agents : consolidation en cours (${count}/${brutRhRecords.length})...`)
      }
    }

    // Gestion des agents qui ne sont plus dans le fichier brut (partis ou absents)
    const missingMatricules = Array.from(refAgentMap.entries())
       .filter(([mat, agent]) => (agent as any).actif === true && mat && !currentBatchMatricules.has(mat))
       .map(([mat]) => mat as string)

    if (missingMatricules.length > 0) {
       stats.agents.left += missingMatricules.length
       // Met à jour en masse comme inactifs
       await prisma.refAgent.updateMany({
           where: { matricule: { in: missingMatricules } },
           data: { 
             actif: false,
             plus_vu: new Date()
           }
       })
    }

    // 4. Process each BRUT_HIERARCHIE -> REF_HIERARCHIE
    // Hierarchie uniquely identified by code_affect
    for (const bh of brutHierRecords) {
        if (!bh.code_affect) continue

        const hierData = {
            nom_affect_l: bh.nom_affect_l,
            code_secteur: bh.code_secteur,
            nom_secteur_l: bh.nom_secteur_l,
            code_service: bh.code_service,
            nom_service_l: bh.nom_service_l,
            code_direction: bh.code_direction,
            nom_direction_l: bh.nom_direction_l,
            code_dg_cab: bh.code_dg_cab,
            nom_dg_cab_l: bh.nom_dg_cab_l,
            plus_vu: new Date().toISOString() as unknown as Date
        }

        const existing = await prisma.refHierarchie.findFirst({
            where: { code_affect: bh.code_affect as string }
        })

        if (existing) {
            await prisma.refHierarchie.update({
                where: { id: existing.id },
                data: hierData
            })
            stats.hier.updated++
        } else {
            await prisma.refHierarchie.create({
                data: {
                    code_affect: bh.code_affect,
                    ...hierData
                }
            })
            stats.hier.created++
        }
    }

    // 5. Final Log
    const modifiedCount = modifiedAgentsSet.size
    stats.agents.updated = modifiedCount
    
    const finalMsg = `Consolidation terminée. Agents : ${stats.agents.created} créés, ${modifiedCount} modifiés, ${stats.agents.left} partis. Hiérarchie : ${stats.hier.created + stats.hier.updated}. Matches : AD(${stats.matched_ad}) Azure(${stats.matched_azure})`
    await prisma.synchroLog.update({
      where: { id: log.id },
      data: {
        statut: 'success',
        message: finalMsg
      }
    })

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('API Synchro RH Error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
