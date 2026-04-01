import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ruleIds = searchParams.get('rules')?.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
    const isCaseSensitive = searchParams.get('caseSensitive') === 'true'

    // Fetch rules using standard prisma client
    const rules = await (prisma as any).alignment.findMany({
      where: ruleIds && ruleIds.length > 0 ? { id: { in: ruleIds } } : {}
    })

    if (rules.length === 0) {
      return NextResponse.json({ agents: [], count: 0 })
    }

    // Fetch agents that have an AD account
    const agents = await prisma.refAgent.findMany({
      where: { NOT: { ad_id: null } },
      select: { id: true, nom: true, prenom: true, matricule: true, ad_id: true, actif: true, niveau_hierarchie: true }
    })

    if (agents.length === 0) {
      return NextResponse.json({ 
        agents: [], 
        count: 0, 
        debug: { message: "Aucun agent n'est lié à l'AD dans le référentiel." } 
      })
    }

    // Using queryRaw to bypass any Prisma client/schema mismatch for BRUT tables
    // We load all data because SQLite case-sensitivity in the IN clause is tricky
    const [brutRhs, brutAds] = await Promise.all([
      prisma.$queryRawUnsafe(`SELECT * FROM "BRUT_RH"`) as Promise<any[]>,
      prisma.brutAd.findMany()
    ])

    const normalizeMatricule = (m: string | null | undefined) => {
      if (!m) return ''
      return String(m).trim().replace(/^0+/, '')
    }

    // Fonction de nettoyage pour une comparaison "humaine" (ignore ponctuation mineure)
    const cleanString = (str: string | null | undefined) => {
      if (!str) return ''
      return String(str)
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlever accents d'abord
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Supprime TOUT ce qui n'est pas une lettre ou un chiffre
        .trim()
    }

    // Indexation par matricule normalisé (sans zéros non significatifs)
    const rhMap = new Map()
    brutRhs.forEach(rh => {
      const m = normalizeMatricule(rh.MATRICULE || rh.matricule)
      if (m) rhMap.set(m, rh)
    })

    // Indexation AD par sam_account en minuscules
    const adMap = new Map()
    brutAds.forEach(ad => {
      if (ad.sam_account) adMap.set(ad.sam_account.toLowerCase(), ad)
    })

    const differences: any[] = []
    let missRH = 0
    let missAD = 0

    for (const agent of agents) {
      const normMat = normalizeMatricule(agent.matricule)
      const rhRecord = rhMap.get(normMat)
      const adRecord = agent.ad_id ? adMap.get(agent.ad_id.toLowerCase()) : null
      
      if (!rhRecord || !adRecord) {
        if (!rhRecord && agent.ad_id) missRH++
        if (!adRecord && agent.ad_id) missAD++
        continue
      }

      const agentDiffs: any[] = []

      for (const rule of rules) {
        const rawRh = String(rhRecord[rule.field_rh] ?? '').trim()
        const rawAd = String(adRecord[rule.field_ad] ?? '').trim()

        let isMatch = false
        if (rule.is_case_sensitive || isCaseSensitive) {
          isMatch = rawRh === rawAd
        } else {
          // Comparaison souple : ignore ponctuation (dot vs dash)
          isMatch = cleanString(rawRh) === cleanString(rawAd)
        }

        if (!isMatch) {
          agentDiffs.push({
            ruleId: rule.id,
            ruleName: rule.name,
            fieldRh: rule.field_rh,
            fieldAd: rule.field_ad,
            valRh: rawRh || '(vide)',
            valAd: rawAd || '(vide)'
          })
        }
      }

      if (agentDiffs.length > 0) {
        differences.push({
          id: agent.id,
          nom: agent.nom,
          prenom: agent.prenom,
          matricule: agent.matricule,
          ad_id: agent.ad_id,
          direction: rhRecord.DIRECTION_L,
          service: rhRecord.SERVICE_L,
          affectation: rhRecord.AFFECT_L,
          statut: rhRecord.STATUT_L,
          date_arrivee: rhRecord.DATE_ARRIVEE,
          date_depart: rhRecord.DATE_DEPART,
          actif: agent.actif,
          niveau_hierarchie: agent.niveau_hierarchie,
          diffs: agentDiffs
        })
      }
    }

    return NextResponse.json({ 
      agents: differences, 
      count: differences.length,
      debug: { 
        missRH, 
        missAD, 
        totalAgents: agents.length, 
        brutRHLoaded: brutRhs.length,
        brutADLoaded: brutAds.length,
        ruleCount: rules.length 
      }
    })
  } catch (error: any) {
    console.error('[API_CHECK_ERROR] CRASH:', error)
    return NextResponse.json({ 
      error: error.message, 
      stack: error.stack 
    }, { status: 500 })
  }
}
