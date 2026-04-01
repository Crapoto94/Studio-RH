import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
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
      await prisma.$executeRaw`UPDATE "SYNCHRO_LOGS" SET progress = ${prog}, message = ${msg} WHERE id = ${log.id}`
    }

    await updateProgress(5, 'Chargement des données brutes...')

    // 2. Fetch all BRUT data and Config
    const brutRhRecords = await prisma.brutRh.findMany()
    const brutHierRecords = await prisma.brutHierarchie.findMany()
    const brutAdRecords = await prisma.brutAd.findMany()
    const brutAzureRecords = await prisma.brutAzure.findMany()
    
    const params = await prisma.parametre.findMany()
    const config = Object.fromEntries(params.map(p => [p.cle, p.valeur]))
    const activePositions = (config['RH_POSITIONS_ACTIVES'] || '').split(',').filter(Boolean)

    const stats = { agents: { updated: 0, created: 0, left: 0 }, hier: { updated: 0, created: 0 }, matched_ad: 0, matched_azure: 0 }

    // Helper for fuzzy matching names
    const normalize = (s: string) => s?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() || ""

    await updateProgress(10, 'Indexation des données pour le rapprochement...')

    // Fetch existing agents to determine creations, updates, and departures
    const existingRefAgents = await prisma.refAgent.findMany({
      select: { matricule: true, actif: true }
    })
    const refAgentMap = new Map(existingRefAgents.map(a => [a.matricule, a.actif]))
    const currentBatchMatricules = new Set<string>()

    // Optimization: Index AD and Azure in Maps for O(1) lookup
    const adByMat = new Map(brutAdRecords.filter(ad => ad.matricule_ad).map(ad => [String(ad.matricule_ad), ad]))
    const adByName = new Map(brutAdRecords.map(ad => [`${normalize(ad.surname || '')}|${normalize(ad.given_name || '')}`, ad]))

    const azureByEmail = new Map()
    brutAzureRecords.forEach(az => {
      if (az.mail) azureByEmail.set(az.mail.toLowerCase(), az)
      if (az.user_principal_name) azureByEmail.set(az.user_principal_name.toLowerCase(), az)
    })
    const azureByName = new Map(brutAzureRecords.map(az => [`${normalize(az.surname || '')}|${normalize(az.given_name || '')}`, az]))

    await updateProgress(15, `Traitement de ${brutRhRecords.length} agents...`)

    // 3. Process each BRUT_RH record -> REF_AGENTS
    let count = 0
    for (const brut of (brutRhRecords as any[])) {
      if (!brut.MATRICULE) continue
      const matStrRaw = String(brut.MATRICULE).trim()
      currentBatchMatricules.add(matStrRaw)
      count++

      const nameKey = `${normalize(brut.NOM || "")}|${normalize(brut.PRENOM || "")}`

      // matching AD
      let adId: string | null = null
      let email: string | null = null
      let mobile: string | null = null
      
      const matNumeric = matStrRaw.replace(/^0+/, '')
      
      let mappedAd: any = adByMat.get(matStrRaw) || adByMat.get(matNumeric) || adByName.get(nameKey)

      if (mappedAd) {
          adId = mappedAd.sam_account
          email = mappedAd.mail || null
          mobile = mappedAd.mobile || mappedAd.telephone || null
          stats.matched_ad++
      }

      // Fallback: If no AD mail, use BrutRh mail (Ciril)
      if (!email && brut.EMAIL_PRO) {
          email = brut.EMAIL_PRO
      }
      if (!mobile && (brut.MOBILE_PRO || brut.TELEPHONE_PRO)) {
          mobile = brut.MOBILE_PRO || brut.TELEPHONE_PRO
      }

      // Matching Azure
      let azureId: string | null = null
      let license: string | null = null
      
      // 1. Priorité Email via AD
      if (mappedAd && mappedAd.mail) {
          const adMail = String(mappedAd.mail).toLowerCase()
          const matchedAz: any = azureByEmail.get(adMail)
          if (matchedAz) {
              azureId = matchedAz.user_principal_name
              license = matchedAz.licenses
              stats.matched_azure++
          }
      }

      // 2. Fallback Nom/Prénom
      if (!azureId) {
          const matchedAz: any = azureByName.get(nameKey)
          if (matchedAz) {
              azureId = matchedAz.user_principal_name
              license = matchedAz.licenses
              stats.matched_azure++
          }
      }

      // Active status based on POSITION_L
      const isActif = activePositions.length === 0 || activePositions.includes(brut.POSITION_L || '')

      // Calcul des stats (Nouveaux, Modifiés, Partis)
      if (!refAgentMap.has(matStrRaw)) {
         stats.agents.created++
      } else {
         const wasActif = refAgentMap.get(matStrRaw)
         if (wasActif === true && isActif === false) {
            stats.agents.left++
         } else {
            stats.agents.updated++
         }
      }

      // Use raw SQL to bypass Prisma client if it's not updated with 'actif' field
      try {
        await prisma.$executeRaw`
          INSERT INTO "REF_AGENTS" (
            matricule, nom, prenom, position_l, code_affect, nom_affect_l, 
            code_service, nom_service, code_direction, nom_direction, 
            code_dg_cab, nom_dg_cab_l, fonction_l, poste_l, date_arrivee, date_depart, plus_vu, 
            ad_id, azure_id, mail, mobile, actif, licence, updated_at
          ) VALUES (
            ${matStrRaw}, ${brut.NOM || 'Inconnu'}, ${brut.PRENOM || 'Inconnu'}, ${brut.POSITION_L}, 
            ${brut.AFFECT}, ${brut.AFFECT_L}, ${brut.SERVICE}, 
            ${brut.SERVICE_L}, ${brut.DIRECTION}, ${brut.DIRECTION_L}, 
            ${brut.DG_CAB}, ${brut.DG_CAB_L || ''}, ${brut.FONCTION_L || ''}, ${brut.POSTE_L || ''}, ${brut.DATE_ARRIVEE}, 
            ${brut.DATE_DEPART}, ${new Date().toISOString()}, 
            ${adId}, ${azureId}, ${email}, ${mobile}, ${isActif ? 1 : 0}, ${license}, ${new Date().toISOString()}
          ) 
          ON CONFLICT(matricule) DO UPDATE SET
            nom=excluded.nom, prenom=excluded.prenom, position_l=excluded.position_l,
            code_affect=excluded.code_affect, nom_affect_l=excluded.nom_affect_l,
            code_service=excluded.code_service, nom_service=excluded.nom_service,
            code_direction=excluded.code_direction, nom_direction=excluded.nom_direction,
            code_dg_cab=excluded.code_dg_cab, nom_dg_cab_l=excluded.nom_dg_cab_l,
            fonction_l=excluded.fonction_l, poste_l=excluded.poste_l,
            date_arrivee=excluded.date_arrivee, date_depart=excluded.date_depart,
            plus_vu=excluded.plus_vu, ad_id=excluded.ad_id, azure_id=excluded.azure_id,
            mail=excluded.mail, mobile=excluded.mobile,
            licence=excluded.licence,
            actif=excluded.actif, updated_at=excluded.updated_at
        `
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
       .filter(([mat, actif]) => actif === true && mat && !currentBatchMatricules.has(mat))
       .map(([mat]) => mat as string)

    if (missingMatricules.length > 0) {
       stats.agents.left += missingMatricules.length
       // Met à jour en masse comme inactifs
       for (const missingMat of missingMatricules) {
           await prisma.$executeRaw`UPDATE "REF_AGENTS" SET actif = 0, updated_at = ${new Date().toISOString()} WHERE matricule = ${missingMat}`
       }
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
    const finalMsg = `Consolidation terminée. Agents : ${stats.agents.created} créés, ${stats.agents.updated} modifiés, ${stats.agents.left} partis. Hiérarchie : ${stats.hier.created + stats.hier.updated}. Matches : AD(${stats.matched_ad}) Azure(${stats.matched_azure})`
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
