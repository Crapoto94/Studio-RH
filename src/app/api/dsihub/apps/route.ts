import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, prismaLocal } from '@/lib/db'

/**
 * Proxy API pour récupérer les applications depuis DSIHub (AppDSI).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // 1. Récupération de l'URL DSIHub configurée
    const dsihubParam = await prismaLocal.parametre.findUnique({
      where: { cle: 'DSIHUB_API_URL' }
    })

    const dsihubBaseUrl = dsihubParam?.valeur || 'http://10.103.130.106:3001/api'
    const endpoint = `${dsihubBaseUrl}/magapp/apps`

    console.log(`[DSIHUB-PROXY] Fetching apps from: ${endpoint}`)

    // Désactiver la vérification TLS si nécessaire (cas du dev local)
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 60 } // Cache d'une minute
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error')
      console.error(`[DSIHUB-PROXY] Error from AppDSI: ${res.status} ${errorText}`)
      return NextResponse.json({ 
        error: `Erreur AppDSI (${res.status})`,
        message: errorText 
      }, { status: res.status })
    }

    const data = await res.json()

    // Résolution du nom du créateur de compte (email_createur, stocké côté
    // AppDSI/magapp_apps) contre l'annuaire RefAgent de RH Studio — AppDSI ne
    // connaît que l'email, pas le nom associé. Best effort : une app sans
    // email_createur ou sans agent correspondant garde juste son email.
    if (Array.isArray(data)) {
      const emails = Array.from(new Set(
        data.map((a: any) => (a.email_createur || '').trim()).filter(Boolean)
      )) as string[]

      if (emails.length > 0) {
        try {
          const agents = await prisma.refAgent.findMany({
            where: { OR: emails.map((e) => ({ mail: { equals: e, mode: 'insensitive' as const } })) },
            select: { mail: true, nom: true, prenom: true },
          })
          const byEmail = new Map(agents.filter((a) => a.mail).map((a) => [a.mail!.toLowerCase(), `${a.prenom} ${a.nom}`]))
          data.forEach((a: any) => {
            const email = (a.email_createur || '').trim().toLowerCase()
            if (email) a.createur_nom = byEmail.get(email) || null
          })
        } catch (e: any) {
          console.error('[DSIHUB-PROXY] Résolution nom créateur échouée:', e.message)
        }
      }
    }

    return NextResponse.json({ data })

  } catch (error: any) {
    console.error('[DSIHUB-PROXY-ERROR]', error.message)
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error.message 
    }, { status: 500 })
  }
}
