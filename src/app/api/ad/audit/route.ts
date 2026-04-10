import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // 1. Charger toutes les données nécessaires
    const [allAgentsWithAd, allBrutAds, exclusions, extraLinks] = await Promise.all([
        prisma.refAgent.findMany({
            where: { NOT: { ad_id: null } },
            select: { ad_id: true }
        }),
        prisma.brutAd.findMany(),
        (prisma as any).adExclusion.findMany(),
        (prisma as any).extraAdLink.findMany()
    ])

    const linkedAdIds = new Set([
        ...allAgentsWithAd.map(a => a.ad_id),
        ...extraLinks.map((l: any) => l.sam_account)
    ])
    const excludedAdIds = new Set(exclusions.map((e: any) => e.sam_account))
    
    // Orphelins : AD présent mais non lié à un agent ET non exclu
    const unlinkedAds = allBrutAds.filter(ad => 
        !linkedAdIds.has(ad.sam_account) && 
        !excludedAdIds.has(ad.sam_account)
    )

    // Comptes Techniques (Exclu)
    const technicalAccounts = exclusions.map((ex: any) => {
        const ad = allBrutAds.find(ad => ad.sam_account === ex.sam_account)
        return ad ? { ...ad, exclusionReason: ex.reason } : null
    }).filter(Boolean)

    // 2. Comptes Fantômes : Agents RH inactifs mais compte AD encore actif
    const ghostAgents = await prisma.refAgent.findMany({
        where: { 
            actif: false, 
            NOT: { ad_id: null } 
        }
    })
    
    const ghostDetails = ghostAgents.map(agent => {
        const ad = allBrutAds.find(ad => ad.sam_account === agent.ad_id && ad.enabled === true)
        return ad ? { agent, ad } : null
    }).filter(Boolean)

    // 3. Licences Inutiles : Comptes AD désactivés mais possédant encore une licence Azure active
    const inactiveAds = allBrutAds.filter(ad => ad.enabled === false && ad.mail)
    const inactiveMails = new Set(inactiveAds.map(ad => ad.mail as string))

    // On récupère tout Azure pour le filtrage en mémoire (performance ok pour < 5000 records)
    const allAzure = await (prisma as any).brutAzure.findMany()
    
    const licenseWaste = inactiveAds.map(ad => {
        const azure = allAzure.find((az: any) => 
            az.mail === ad.mail || az.user_principal_name === ad.mail
        )
        if (azure && azure.licenses && azure.licenses !== '[]' && azure.licenses !== '') {
            return { ad, azure }
        }
        return null
    }).filter(Boolean)

    return NextResponse.json({
        unlinkedAds,
        ghostAccounts: ghostDetails,
        licenseWaste,
        technicalAccounts
    })
  } catch (err: any) {
    console.error('[API-AD-AUDIT-ERROR]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
