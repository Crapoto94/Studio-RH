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

    const log = await prisma.synchroLog.create({
      data: {
        type: 'ad',
        statut: 'en_cours',
        message: 'Liaison AD en cours (Calcul des correspondances)...'
      }
    })
    
    await prisma.$executeRaw`UPDATE "SYNCHRO_LOGS" SET progress = 0 WHERE id = ${log.id}`

    const updateProgress = async (prog: number, msg?: string) => {
      await prisma.$executeRaw`UPDATE "SYNCHRO_LOGS" SET progress = ${prog}, message = ${msg || null} WHERE id = ${log.id}`
    }

    // 1. Fetch Data
    await updateProgress(10, 'Récupération des données...')
    const agents = await prisma.refAgent.findMany()
    const brutAds = await prisma.brutAd.findMany()

    const normalize = (s: string) => s?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() || ""

    let matchedCount = 0
    const total = agents.length

    // 2. Process matching
    for (let i = 0; i < total; i++) {
      const agent = agents[i]
      const normNom = normalize(agent.nom)
      const normPrenom = normalize(agent.prenom)

      // Try matching by Matricule first
      const match = brutAds.find(ad => {
          const adMat = ad.matricule_ad ? String(ad.matricule_ad) : null
          if (adMat && agent.matricule && adMat === agent.matricule) return true
          
          const adNom = normalize(ad.surname || '')
          const adPrenom = normalize(ad.given_name || '')
          return adNom === normNom && adPrenom === normPrenom
      })

      if (match) {
        await prisma.$executeRaw`UPDATE "REF_AGENTS" SET ad_id = ${match.sam_account} WHERE id = ${agent.id}`
        matchedCount++
      }

      if (i % 50 === 0) {
        await updateProgress(Math.min(95, 10 + Math.floor((i / total) * 85)), `Traitement : ${i}/${total} agents...`)
      }
    }

    const msg = `Liaison AD terminée : ${matchedCount} agents liés sur ${total}.`
    await prisma.$executeRaw`UPDATE "SYNCHRO_LOGS" SET progress = 100, message = ${msg}, statut = 'success' WHERE id = ${log.id}`

    return NextResponse.json({ success: true, matchedCount, total })
  } catch (error) {
    console.error('API Synchro AD Error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
