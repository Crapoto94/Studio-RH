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
        type: 'ad',
        statut: 'en_cours',
        message: 'Liaison AD en cours (Calcul des correspondances)...'
      }
    })
    
    await prisma.synchroLog.update({
      where: { id: log.id },
      data: { progress: 0 }
    })

    const updateProgress = async (prog: number, msg?: string) => {
      await prisma.synchroLog.update({
        where: { id: log.id },
        data: { progress: prog, message: msg || null }
      })
    }

    // 1. Fetch Data
    await updateProgress(10, 'Récupération des données...')
    const agents = await prisma.refAgent.findMany()
    const brutAds = await prisma.brutAd.findMany()
    
    // Pour accélérer la recherche, on indexe le BrutAd par sam_account
    const adMap = new Map()
    brutAds.forEach(ad => {
        if (ad.sam_account) adMap.set(ad.sam_account, ad)
    })

    const normalize = (s: string) => s?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() || ""

    let matchedCount = 0
    let updatedCount = 0
    const total = agents.length

    // 2. Process
    for (let i = 0; i < total; i++) {
      const agent = agents[i]
      
      if (!agent.ad_id) {
          // --- CAS 1 : LIAISON AUTOMATIQUE ---
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
            await prisma.refAgent.update({
              where: { id: agent.id },
              data: { ad_id: match.sam_account }
            })
            matchedCount++
          }
      } else {
          // --- CAS 2 : MISE À JOUR MÉTADONNÉES (EMAIL) ---
          const ad = adMap.get(agent.ad_id)
          if (ad && ad.mail) {
              const oldMail = agent.mail || ''
              const newMail = ad.mail

              if (oldMail.toLowerCase() !== newMail.toLowerCase()) {
                  // Log du changement
                  await prisma.syncAgentLog.create({
                      data: {
                          synchro_id: log.id,
                          matricule: agent.matricule || 'Sans matricule',
                          agent_nom: `${agent.nom} ${agent.prenom}`,
                          field: 'mail',
                          old_value: oldMail,
                          new_value: newMail
                      }
                  })

                  // Mise à jour de l'agent
                  await prisma.refAgent.update({
                      where: { id: agent.id },
                      data: { mail: newMail }
                  })
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

    return NextResponse.json({ success: true, matchedCount, updatedCount, total })
  } catch (error) {
    console.error('API Synchro AD Error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
