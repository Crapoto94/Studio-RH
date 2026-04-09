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

    const log = await prisma.synchroLog.create({
      data: {
        type: 'azure',
        statut: 'en_cours',
        message: 'Liaison Azure AD et calcul des licences en cours...'
      }
    })

    const updateProgress = async (prog: number, msg: string) => {
        await prisma.synchroLog.update({
            where: { id: log.id },
            data: { progress: prog, message: msg }
        })
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

        // 1. Chercher par email de l'AD associé si l'agent a un ad_id
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

        // 2. Fallback par nom et prénom
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

    const resMsg = `[AZURE] Liaison Azure terminée. ${linksAdded} nouveaux liens, ${linksUpdated} mis à jour. Total Azure liés: ${agents.filter(a => a.azure_id).length + linksAdded}`
    
    await prisma.synchroLog.update({
      where: { id: log.id },
      data: { progress: 100, message: resMsg, statut: 'success' }
    })

    return NextResponse.json({ success: true, message: resMsg, stats: { added: linksAdded, updated: linksUpdated } })
  } catch (error) {
    console.error('API Synchro Azure Error:', error)
    await prisma.synchroLog.create({
      data: {
        type: 'azure',
        statut: 'error',
        message: 'Erreur lors de la liaison Azure: ' + (error as Error).message
      }
    })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
