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

    const { agentId, adId } = await req.json()
    if (!agentId) return NextResponse.json({ error: 'Agent manquant' }, { status: 400 })

    let azureId: string | null = null
    let licence: string | null = null
    let mail: string | null = null

    if (adId) {
        // --- LOGIQUE DE PROMOTION / SWAP ---
        const agent = await prisma.refAgent.findUnique({
            where: { id: agentId },
            include: { extra_ad_links: true }
        })

        if (agent) {
            const isExtra = agent.extra_ad_links.find(l => l.sam_account === adId)
            if (isExtra) {
                // Promotion : le compte secondaire devient primaire
                // On bascule l'ancien primaire en secondaire s'il existe
                if (agent.ad_id) {
                    await prisma.extraAdLink.upsert({
                        where: { sam_account: agent.ad_id },
                        create: { agent_id: agentId, sam_account: agent.ad_id },
                        update: { agent_id: agentId }
                    })
                }
                // On supprime l'ancien lien secondaire qui est devenu primaire
                await prisma.extraAdLink.delete({ where: { sam_account: adId } })
            }
        }

        // 1. Get info from BrutAd for metadata sync (email/azure)
        const adInfo = await prisma.brutAd.findFirst({
            where: { sam_account: adId }
        })

        if (adInfo && adInfo.mail) {
            // 2. Lookup in BrutAzure
            const azureInfo = await prisma.brutAzure.findFirst({
                where: {
                    OR: [
                        { mail: { equals: adInfo.mail } },
                        { user_principal_name: { equals: adInfo.mail } }
                    ]
                }
            })

            if (azureInfo) {
                azureId = azureInfo.user_principal_name
                licence = azureInfo.licenses
                mail = azureInfo.mail || adInfo.mail
            } else {
                mail = adInfo.mail
            }
        }
    }

    if (!adId) {
        // Désassociation complète : on supprime aussi tous les comptes secondaires
        await prisma.extraAdLink.deleteMany({
            where: { agent_id: agentId }
        })
    }

    await prisma.refAgent.update({
      where: { id: agentId },
      data: {
        ad_id: adId || null,
        azure_id: azureId,
        licence: licence,
        // Explicitement `null` (et non `undefined`) : `mail` doit toujours
        // refléter le compte AD/Azure actuellement lié, jamais une valeur
        // laissée par un ancien lien. `undefined` ferait ignorer ce champ
        // par Prisma et laisserait un email périmé en base après un
        // "Détacher le compte principal" (cf. ZRAIDI Samira / 0017743).
        mail: mail
      }
    })

    return NextResponse.json({ success: true, azureId, licence })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
