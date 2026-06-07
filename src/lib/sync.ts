import { prisma, prismaLocal } from '@/lib/db'
import { Client } from 'ldapts'

type SyncResult = { success: boolean; message: string; stats?: any; errors?: string[] }

// ── RH Sync ──────────────────────────────────────────────────
export async function runRhSync(): Promise<SyncResult> {
  const log = await prisma.synchroLog.create({
    data: { type: 'rh', statut: 'en_cours', message: 'Début de la consolidation (Agents + Hiérarchie)...' }
  })

  const updateProgress = async (prog: number, msg: string) => {
    await prisma.synchroLog.update({ where: { id: log.id }, data: { progress: prog, message: msg } })
  }

  await updateProgress(5, 'Chargement des données brutes...')

  const brutRhRecords = await prisma.brutRh.findMany()
  const brutHierRecords = await prisma.brutHierarchie.findMany()

  const params = await prismaLocal.parametre.findMany()
  const config = Object.fromEntries(params.map(p => [p.cle, p.valeur]))
  const activePositions = (config['RH_POSITIONS_ACTIVES'] || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)

  const stats = { agents: { updated: 0, created: 0, left: 0 }, hier: { updated: 0, created: 0 }, matched_ad: 0, matched_azure: 0 }
  const modifiedAgentsSet = new Set<string>()

  await updateProgress(10, 'Indexation des données...')

  const existingRefAgents = await prisma.refAgent.findMany()
  const refAgentMap = new Map(existingRefAgents.map(a => [a.matricule, a]))
  const currentBatchMatricules = new Set<string>()

  await updateProgress(15, `Traitement de ${brutRhRecords.length} agents...`)

  let count = 0
  for (const brut of (brutRhRecords as any[])) {
    if (!brut.MATRICULE) continue
    const matStrRaw = String(brut.MATRICULE).trim()
    currentBatchMatricules.add(matStrRaw)
    count++

    const email = brut.EMAIL_PRO || null
    const mobile = brut.MOBILE_PRO || brut.TELEPHONE_PRO || null

    const currentPos = (brut.POSITION_L || '').trim().toLowerCase()
    const isActif = activePositions.length === 0 || activePositions.includes(currentPos)

    const existingAgent = refAgentMap.get(matStrRaw) as any

    if (!existingAgent) {
      stats.agents.created++
    } else {
      const wasActif = existingAgent.actif
      if (wasActif === true && isActif === false) {
        stats.agents.left++
      }
    }

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
        mobile: mobile,
        actif: isActif,
      }

      if (existingAgent) {
        const fieldsToMonitor = [
          'nom', 'prenom', 'position_l', 'code_affect', 'nom_affect_l',
          'code_service', 'nom_service', 'code_direction', 'nom_direction',
          'code_dg_cab', 'nom_dg_cab_l', 'fonction_l', 'poste_l',
          'mobile', 'actif'
        ]

        for (const field of fieldsToMonitor) {
          let oldVal = String(existingAgent[field] || '')
          let newVal = String((agentData as any)[field] || '')

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
        create: { matricule: matStrRaw, ...agentData },
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

  const missingMatricules = Array.from(refAgentMap.entries())
    .filter(([mat, agent]) => (agent as any).actif === true && mat && !currentBatchMatricules.has(mat))
    .map(([mat]) => mat as string)

  if (missingMatricules.length > 0) {
    stats.agents.left += missingMatricules.length
    await prisma.refAgent.updateMany({
      where: { matricule: { in: missingMatricules } },
      data: { actif: false, plus_vu: new Date() }
    })
  }

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
      await prisma.refHierarchie.update({ where: { id: existing.id }, data: hierData })
      stats.hier.updated++
    } else {
      await prisma.refHierarchie.create({ data: { code_affect: bh.code_affect, ...hierData } })
      stats.hier.created++
    }
  }

  const modifiedCount = modifiedAgentsSet.size
  stats.agents.updated = modifiedCount

  const finalMsg = `Consolidation terminée. Agents : ${stats.agents.created} créés, ${modifiedCount} modifiés, ${stats.agents.left} partis. Hiérarchie : ${stats.hier.created + stats.hier.updated}.`
  await prisma.synchroLog.update({
    where: { id: log.id },
    data: { statut: 'success', message: finalMsg }
  })

  return { success: true, message: finalMsg, stats }
}

// ── AD Sync ──────────────────────────────────────────────────
export async function runAdSync(): Promise<SyncResult> {
  const log = await prisma.synchroLog.create({
    data: { type: 'ad', statut: 'en_cours', message: 'Liaison AD en cours (Calcul des correspondances)...' }
  })

  const updateProgress = async (prog: number, msg?: string) => {
    await prisma.synchroLog.update({ where: { id: log.id }, data: { progress: prog, message: msg || null } })
  }

  await updateProgress(10, 'Récupération des données...')
  const agents = await prisma.refAgent.findMany()
  const brutAds = await prisma.brutAd.findMany()

  const adMap = new Map()
  brutAds.forEach(ad => { if (ad.sam_account) adMap.set(ad.sam_account, ad) })

  const normalize = (s: string) => s?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() || ""

  let matchedCount = 0
  let updatedCount = 0
  const total = agents.length

  for (let i = 0; i < total; i++) {
    const agent = agents[i]

    if (!agent.ad_id) {
      const normNom = normalize(agent.nom)
      const normPrenom = normalize(agent.prenom)

      const match = brutAds.find(ad => {
        const adMat = ad.matricule_ad ? String(ad.matricule_ad) : null
        if (adMat && agent.matricule && adMat === agent.matricule) return true
        const adNom = normalize(ad.surname || '')
        const adPrenom = normalize(ad.given_name || '')
        return adNom === normNom && adPrenom === normPrenom
      })

      if (match) {
        await prisma.refAgent.update({ where: { id: agent.id }, data: { ad_id: match.sam_account } })
        matchedCount++
      }
    } else {
      const ad = adMap.get(agent.ad_id)
      if (ad && ad.mail) {
        const oldMail = agent.mail || ''
        const newMail = ad.mail
        if (oldMail.toLowerCase() !== newMail.toLowerCase()) {
          await (prisma.syncAgentLog as any).create({
            data: {
              synchro_id: log.id,
              matricule: agent.matricule || 'Sans matricule',
              agent_nom: `${agent.nom} ${agent.prenom}`,
              field: 'mail',
              old_value: oldMail,
              new_value: newMail
            }
          })
          await prisma.refAgent.update({ where: { id: agent.id }, data: { mail: newMail } })
          updatedCount++
        }
      }
    }

    if (i % 25 === 0) {
      await updateProgress(Math.min(95, 10 + Math.floor((i / total) * 85)), `Traitement : ${i}/${total} agents...`)
    }
  }

  const msg = `Synchro AD terminée : ${matchedCount} nouvelles liaisons, ${updatedCount} emails mis à jour sur ${total} agents.`
  await prisma.synchroLog.update({
    where: { id: log.id },
    data: { progress: 100, message: msg, statut: 'success' }
  })

  return { success: true, message: msg, stats: { matchedCount, updatedCount, total } }
}

// ── Azure Sync ────────────────────────────────────────────────
export async function runAzureSync(): Promise<SyncResult> {
  const log = await prisma.synchroLog.create({
    data: { type: 'azure', statut: 'en_cours', message: 'Liaison Azure AD et calcul des licences en cours...' }
  })

  const updateProgress = async (prog: number, msg: string) => {
    await prisma.synchroLog.update({ where: { id: log.id }, data: { progress: prog, message: msg } })
  }

  await updateProgress(10, 'Récupération des données BRUT et Agents...')
  const agents = await prisma.refAgent.findMany()
  const brutAzureData = await prisma.brutAzure.findMany()
  const brutAdData = await prisma.brutAd.findMany()

  const normalize = (s: string) => s?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() || ""

  let linksAdded = 0
  let linksUpdated = 0

  await updateProgress(30, `Traitement de ${agents.length} agents...`)

  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i]
    let azureId: string | null = null
    let licencesJson: string | null = null

    if (agent.ad_id) {
      const linkedAd = brutAdData.find(ad => ad.sam_account === agent.ad_id)
      if (linkedAd && linkedAd.mail) {
        const adMail = String(linkedAd.mail).toLowerCase()
        const matchByMail = brutAzureData.find(az =>
          String(az.mail || '').toLowerCase() === adMail ||
          String(az.user_principal_name || '').toLowerCase() === adMail
        )
        if (matchByMail) {
          azureId = matchByMail.user_principal_name
          licencesJson = matchByMail.licenses || null
        }
      }
    }

    if (!azureId) {
      const normNom = normalize(agent.nom || "")
      const normPrenom = normalize(agent.prenom || "")
      const matchByName = brutAzureData.find(az => {
        const azNom = normalize(az.surname || "")
        const azPrenom = normalize(az.given_name || "")
        return azNom === normNom && azPrenom === normPrenom
      })
      if (matchByName) {
        azureId = matchByName.user_principal_name
        licencesJson = matchByName.licenses || null
      }
    }

    if (azureId) {
      if (agent.azure_id !== azureId || agent.licence !== licencesJson) {
        await prisma.refAgent.update({
          where: { id: agent.id },
          data: { azure_id: azureId, licence: licencesJson }
        })
        agent.azure_id ? linksUpdated++ : linksAdded++
      }
    }

    if (i > 0 && i % 100 === 0) {
      await updateProgress(30 + Math.floor((i / agents.length) * 60), `Analyse : ${i}/${agents.length} agents...`)
    }
  }

  const msg = `[AZURE] Liaison Azure terminée. ${linksAdded} nouveaux liens, ${linksUpdated} mis à jour.`
  await prisma.synchroLog.update({
    where: { id: log.id },
    data: { progress: 100, message: msg, statut: 'success' }
  })

  return { success: true, message: msg, stats: { added: linksAdded, updated: linksUpdated } }
}

// ── Brut (Import complet depuis Oracle/AD/Azure) ─────────────────
export async function runBrutSync(): Promise<SyncResult> {
  const log = await prisma.synchroLog.create({
    data: { type: 'brut', statut: 'en_cours', message: 'Initialisation...' }
  })

  const updateProgress = async (prog: number, msg: string) => {
    await prisma.synchroLog.update({ where: { id: log.id }, data: { progress: prog, message: msg } })
  }

  await updateProgress(2, 'Chargement des paramètres...')

  const params = await prismaLocal.parametre.findMany()
  const config = Object.fromEntries(params.map(p => [p.cle, p.valeur]))

  const apiUrl = config['API_ASTRE_URL'] || config['API_VILLE_URL']
  const apiKey = config['API_ASTRE_KEY'] || config['API_VILLE_TOKEN']
  const rhViewName = config['SQL_VIEW_RH'] || 'V_AGENT_RH_FULL'
  let hierViewName = config['SQL_VIEW_HIER'] || 'rh_siim_organigramme_v2'
  // Auto-upgrade from old table name
  if (hierViewName === 'rh_siim_organigramme') {
    console.log('[BRUT] Upgrading hierarchy view from rh_siim_organigramme to rh_siim_organigramme_v2')
    hierViewName = 'rh_siim_organigramme_v2'
  }

  const adUrl = config['AD_SERVER_URL'] || config['AD_SERVER']
  const adPort = parseInt(config['AD_PORT'] || '389', 10)
  const adBase = config['AD_BASE_DN']
  const adUser = config['AD_SRV_ACCOUNT'] || config['AD_USER']
  const adPass = config['AD_SRV_PASSWORD'] || config['AD_PASSWORD']
  const adAttrMat = config['AD_ATTRIBUTE_MATRICULE'] || 'employeeID'

  const azureTenant = config['AZURE_TENANT_ID'] || config['AZURE_TENANT']
  const azureClient = config['AZURE_CLIENT_ID'] || config['AZURE_CLIENT']
  const azureSecret = config['AZURE_CLIENT_SECRET'] || config['AZURE_SECRET']

  const stats = { rh: 0, hier: 0, ad: 0, azure: 0, errors: [] as string[] }

  await updateProgress(5, 'Paramètres chargés. Démarrage des imports...')

  // 3. Import RH Oracle
  if (apiUrl && rhViewName) {
    await updateProgress(8, `[RH] Connexion à l'API Oracle (${apiUrl})...`)
    try {
      let base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
      const urlObj = new URL(base)
      if (!urlObj.pathname.toLowerCase().startsWith('/api')) base += '/api'
      const targetUrl = `${base}/v1/oracle/query`

      await updateProgress(10, `[RH] Requête SQL : SELECT * FROM ${rhViewName}...`)
      const resRh = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'x-api-key': apiKey || '', 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'RH', sql: `SELECT * FROM ${rhViewName}` }),
        signal: AbortSignal.timeout(60000)
      })

      if (resRh.ok) {
        const dataRh = await resRh.json()
        if (Array.isArray(dataRh)) {
          await updateProgress(13, `[RH] ${dataRh.length} lignes reçues. Suppression ancienne table...`)
          await prisma.brutRh.deleteMany()
          await updateProgress(15, `[RH] Insertion en cours (0/${dataRh.length})...`)

          const allowedKeys = [
            'MATRICULE', 'NOM', 'PRENOM', 'STATUT', 'STATUT_L', 'DIRECTION', 'DIRECTION_L', 'SERVICE', 'SERVICE_L',
            'PST_AFFECT', 'PST_AFFECT_L', 'AFFECT', 'AFFECT_L', 'POSTE', 'POSTE_L', 'FONCTION', 'FONCTION_L',
            'AFFECTGEO', 'AFFECTGEO_L', 'AGT_GRADE', 'AGT_GRADE_L', 'PST_CADREMP', 'PST_CADREMP_L', 'PST_CAT',
            'DATE_ARRIVEE', 'MOTIF_ARRIVEE', 'DATE_DEPART', 'MOTIF_DEPART', 'DATE_MODIF_DOSS', 'DATE_EXTRACT_DOSS',
            'DATE_MAJ', 'COLLECTIVITE', 'COLLECTIVITE_L', 'POSITION', 'POSITION_L', 'FIN_PREV_POS',
            'CIVILITE', 'EMAIL_PERSO', 'EMAIL_PRO', 'TELEPHONE_PRO', 'MOBILE_PRO', 'TEMPS_PARTIEL',
            'TEMPS_PARTIEL_L', 'ID_AGENT', 'ID_AGENT_ABS', 'DG_CAB', 'DG_CAB_L'
          ]

          const mappedRh = dataRh.map((item: any) => {
            const row: any = {}
            for (const key of allowedKeys) {
              if (item[key] !== undefined && item[key] !== null) {
                const val = String(item[key]).trim()
                row[key] = val === '' ? null : val
              } else {
                row[key] = null
              }
            }
            return row
          })

          for (let i = 0; i < mappedRh.length; i += 500) {
            await prisma.brutRh.createMany({ data: mappedRh.slice(i, i + 500) })
            const pct = 15 + Math.floor((i / mappedRh.length) * 11)
            await updateProgress(pct, `[1/4] SIRH : insertion ${Math.min(i + 500, mappedRh.length)}/${mappedRh.length} agents...`)
          }
          stats.rh = mappedRh.length
          await updateProgress(26, `[1/4] SIRH : ✓ ${stats.rh} agents importés.`)
        } else {
          stats.errors.push(`RH: réponse inattendue (pas un tableau)`)
        }
      } else {
        const errBody = await resRh.text().catch(() => '')
        stats.errors.push(`RH HTTP ${resRh.status}: ${errBody.slice(0, 150)}`)
        await updateProgress(26, `[RH] ✗ Erreur HTTP ${resRh.status}`)
      }
    } catch (e: any) {
      stats.errors.push(`RH Exception: ${e.message}`)
      await updateProgress(26, `[RH] ✗ Exception: ${e.message.slice(0, 100)}`)
    }
  } else {
    await updateProgress(26, `[RH] ⚠ Ignoré (API_URL=${apiUrl ? 'ok' : 'manquant'}, VUE=${rhViewName || 'manquant'})`)
  }

  // 4. Import Hiérarchie Oracle
  if (apiUrl && hierViewName) {
    await updateProgress(28, `[HIER] Connexion à l'API Oracle...`)
    try {
      let base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
      const urlObj = new URL(base)
      if (!urlObj.pathname.toLowerCase().startsWith('/api')) base += '/api'
      const targetUrl = `${base}/v1/oracle/query`

      await updateProgress(30, `[HIER] Requête SQL : SELECT * FROM ${hierViewName}...`)
      const resHier = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'x-api-key': apiKey || '', 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'RH', sql: `SELECT * FROM ${hierViewName}` }),
        signal: AbortSignal.timeout(60000)
      })

      if (resHier.ok) {
        const dataHier = await resHier.json()
        if (Array.isArray(dataHier)) {
          await updateProgress(33, `[HIER] ${dataHier.length} lignes reçues. Suppression ancienne table...`)
          await prisma.brutHierarchie.deleteMany()
          const mappedHier = dataHier.map((item: any) => ({
            code_affect: String(item.AFFECT || item.CODE_AFFECT || ''),
            nom_affect_l: String(item.AFFECT_L || item.NOM_AFFECT_L || ''),
            code_secteur: String(item.SECTEUR || item.CODE_SECTEUR || ''),
            nom_secteur_l: String(item.SECTEUR_L || item.NOM_SECTEUR_L || ''),
            code_service: String(item.SERVICE || item.CODE_SERVICE || ''),
            nom_service_l: String(item.SERVICE_L || item.NOM_SERVICE_L || ''),
            code_direction: String(item.DIRECTION || item.CODE_DIRECTION || ''),
            nom_direction_l: String(item.DIRECTION_L || item.NOM_DIRECTION_L || ''),
            code_dg_cab: String(item.DG_CAB || item.CODE_DG_CAB || ''),
            nom_dg_cab_l: String(item.DG_CAB_L || item.NOM_DG_CAB_L || ''),
            type_structure: String(item.TYPE_STRUCTURE || ''),
            responsable_nom: String(item.RESPONSABLE_NOM || ''),
            responsable_id: String(item.RESPONSABLE_ID || '')
          }))
          await updateProgress(36, `[2/4] Hiérarchie : insertion de ${mappedHier.length} structures...`)
          await prisma.brutHierarchie.createMany({ data: mappedHier })
          stats.hier = mappedHier.length
          await updateProgress(40, `[2/4] Hiérarchie : ✓ ${stats.hier} structures importées.`)
        } else {
          stats.errors.push(`HIER: réponse inattendue (pas un tableau)`)
        }
      } else {
        const errBody = await resHier.text().catch(() => '')
        stats.errors.push(`HIER HTTP ${resHier.status}: ${errBody.slice(0, 150)}`)
        await updateProgress(40, `[HIER] ✗ Erreur HTTP ${resHier.status}`)
      }
    } catch (e: any) {
      stats.errors.push(`HIER Exception: ${e.message}`)
      await updateProgress(40, `[HIER] ✗ Exception: ${e.message.slice(0, 100)}`)
    }
  } else {
    await updateProgress(40, `[HIER] ⚠ Ignoré (VUE=${hierViewName || 'manquant'})`)
  }

  // 5. Import AD (LDAP)
  if (adUrl && adUser && adPass && adBase) {
    await updateProgress(42, `[3/4] AD : connexion LDAP à ${adUrl}:${adPort}...`)
    try {
      const ldapUrl = adUrl.startsWith('ldap') ? adUrl : `ldap://${adUrl}`
      const client = new Client({ url: `${ldapUrl.replace(/:\d+$/, '')}:${adPort}`, timeout: 10000 })
      await client.bind(adUser, adPass)
      await updateProgress(45, `[3/4] AD : connexion OK. Recherche des comptes...`)

      const { searchEntries } = await client.search(adBase, {
        scope: 'sub',
        filter: '(&(objectClass=user)(objectCategory=person))',
        attributes: [
          'sAMAccountName', 'distinguishedName', 'displayName', 'givenName', 'sn', 'mail',
          'userAccountControl', adAttrMat, 'title', 'department', 'company', 'manager',
          'physicalDeliveryOfficeName', 'telephoneNumber', 'mobile', 'whenCreated',
          'extensionAttribute1', 'extensionAttribute2', 'extensionAttribute3', 'memberOf', 'employeeID'
        ]
      })
      await client.unbind()

      await updateProgress(50, `[3/4] AD : ${searchEntries.length} comptes trouvés. Préparation...`)
      await prisma.brutAd.deleteMany()

      const mappedAd = (searchEntries as any[]).map(entry => {
        const sam = String(entry.sAMAccountName || '')
        let mo = entry.memberOf ? (Array.isArray(entry.memberOf) ? entry.memberOf.join('; ') : String(entry.memberOf)) : ''
        if (mo.length > 3000) mo = mo.slice(0, 2997) + '...'
        return {
          sam_account: sam,
          distinguished_name: String(entry.distinguishedName || ''),
          display_name: String(entry.displayName || ''),
          given_name: String(entry.givenName || ''),
          surname: String(entry.sn || ''),
          mail: String(entry.mail || ''),
          enabled: !(Number(entry.userAccountControl) & 2),
          title: String(entry.title || ''),
          department: String(entry.department || ''),
          company: String(entry.company || ''),
          manager: String(entry.manager || ''),
          office: String(entry.physicalDeliveryOfficeName || ''),
          telephone: String(entry.telephoneNumber || ''),
          mobile: String(entry.mobile || ''),
          matricule_ad: entry[adAttrMat] ? String(entry[adAttrMat]) : '',
          when_created: String(entry.whenCreated || ''),
          ext_attr1: String(entry.extensionAttribute1 || ''),
          ext_attr2: String(entry.extensionAttribute2 || ''),
          ext_attr3: String(entry.extensionAttribute3 || ''),
          member_of: mo,
          employee_id: String(entry.employeeID || '')
        }
      }).filter(e => e.sam_account)

      try {
        for (let i = 0; i < mappedAd.length; i += 200) {
          await prisma.brutAd.createMany({ data: mappedAd.slice(i, i + 200) })
          const pct = 50 + Math.floor((i / mappedAd.length) * 18)
          await updateProgress(pct, `[3/4] AD : insertion ${Math.min(i + 200, mappedAd.length)}/${mappedAd.length} comptes...`)
        }
        stats.ad = mappedAd.length
      } catch (dbErr: any) {
        stats.errors.push(`AD DB Error: ${dbErr.message}`)
      }
      await updateProgress(68, `[3/4] AD : ✓ ${stats.ad} comptes AD importés.`)
    } catch (e: any) {
      stats.errors.push(`AD Exception: ${e.message}`)
      await updateProgress(68, `[AD] ✗ Exception: ${e.message.slice(0, 100)}`)
    }
  } else {
    await updateProgress(68, `[AD] ⚠ Ignoré (URL=${adUrl ? 'ok' : 'manquant'}, User=${adUser ? 'ok' : 'manquant'})`)
  }

  // 6. Import Azure / Entra ID
  if (azureTenant && azureClient && azureSecret) {
    await updateProgress(70, `[AZURE] Obtention du token Microsoft Graph (tenant: ${azureTenant.slice(0, 8)}...)...`)
    try {
      const tokenRes = await fetch(
        `https://login.microsoftonline.com/${azureTenant}/oauth2/v2.0/token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: azureClient,
            client_secret: azureSecret,
            scope: 'https://graph.microsoft.com/.default',
            grant_type: 'client_credentials'
          }),
          signal: AbortSignal.timeout(15000)
        }
      )

      if (!tokenRes.ok) {
        const errText = await tokenRes.text()
        stats.errors.push(`Azure Token ${tokenRes.status}: ${errText.slice(0, 150)}`)
        await updateProgress(95, `[4/4] Azure : ✗ Erreur token: HTTP ${tokenRes.status}`)
      } else {
        const { access_token } = await tokenRes.json()
        await updateProgress(72, `[4/4] Azure : token OK. Préparation...`)
        await prisma.brutAzure.deleteMany()

        let nextUrl: string | null =
          'https://graph.microsoft.com/v1.0/users?$select=id,userPrincipalName,displayName,givenName,surname,mail,accountEnabled,assignedLicenses,jobTitle,department,officeLocation,companyName,createdDateTime,usageLocation,mobilePhone&$top=999'
        let page = 0

        while (nextUrl) {
          page++
          await updateProgress(72 + Math.min(20, page * 3), `[4/4] Azure : page ${page} (${stats.azure} récupérés)...`)
          const usersRes: any = await fetch(nextUrl, {
            headers: { Authorization: `Bearer ${access_token}` },
            signal: AbortSignal.timeout(30000)
          })
          if (!usersRes.ok) { stats.errors.push(`Azure Users HTTP ${usersRes.status}`); break }
          const usersData: any = await usersRes.json()
          const users: any[] = usersData.value || []

          const skuMap: Record<string, string> = {
            '18181a46-0d4e-45cd-891e-60aabd171b4e': 'O365 E1',
            '6fd2c87f-b296-42f0-b197-1e91e994b900': 'O365 E3',
            'c7df2760-2c81-4ef7-b578-5b5392b571df': 'O365 E5',
            '4b585984-651b-448a-9e53-3b10f069cf7f': 'O365 F3',
            '05e9a617-0261-4cee-970c-88701fd0fc0b': 'M365 E3',
            '06ebc4ee-1bb5-47dd-8120-11324bc54e06': 'M365 E5',
            '314c4481-f395-4525-be8b-2ec4bb1e9d91': 'M365 F3',
            '1f2f344a-700d-42c9-9427-5cea1d5d7ba6': 'M365 F1',
            'c1ee3550-93dd-4d80-82a1-aa837f44358a': 'M365 F1'
          }

          const mappedAz = users.map((u: any) => ({
            user_principal_name: String(u.userPrincipalName || ''),
            display_name: String(u.displayName || ''),
            given_name: String(u.givenName || ''),
            surname: String(u.surname || ''),
            mail: String(u.mail || ''),
            account_enabled: u.accountEnabled ? true : false,
            licenses: JSON.stringify((u.assignedLicenses || []).map((l: any) => skuMap[l.skuId] || l.skuId)),
            azure_id: String(u.id || ''),
            job_title: String(u.jobTitle || ''),
            department: String(u.department || ''),
            office_location: String(u.officeLocation || ''),
            company_name: String(u.companyName || ''),
            created_at_azure: String(u.createdDateTime || ''),
            usage_location: String(u.usageLocation || ''),
            mobile_phone: String(u.mobilePhone || '')
          })).filter((az: any) => az.user_principal_name)

          if (mappedAz.length > 0) {
            await prisma.brutAzure.createMany({ data: mappedAz })
            stats.azure += mappedAz.length
          }
          nextUrl = usersData['@odata.nextLink'] || null
        }
        await updateProgress(93, `[4/4] Azure : ✓ ${stats.azure} utilisateurs importés.`)
      }
    } catch (e: any) {
      stats.errors.push(`Azure Exception: ${e.message}`)
      await updateProgress(93, `[AZURE] ✗ Exception: ${e.message.slice(0, 100)}`)
    }
  } else {
    await updateProgress(93, `[AZURE] ⚠ Ignoré (TENANT=${azureTenant ? 'ok' : 'manquant'}, CLIENT=${azureClient ? 'ok' : 'manquant'})`)
  }

  const errDetail = stats.errors.length > 0 ? ` | Erreurs: ${stats.errors.join(' ; ')}` : ''
  const msg = `Synchronisation BRUT terminée : ${stats.rh} agents, ${stats.hier} structures, ${stats.ad} AD, ${stats.azure} Azure. ${stats.errors.length} erreur(s).${errDetail}`
  const statStr = stats.errors.length === 0 ? 'success' : 'partial'
  await prisma.synchroLog.update({
    where: { id: log.id },
    data: { progress: 100, message: msg, statut: statStr }
  })

  return { success: stats.errors.length === 0, message: msg, stats, errors: stats.errors }
}
