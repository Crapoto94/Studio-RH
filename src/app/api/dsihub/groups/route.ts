import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaLocal } from '@/lib/db'

/**
 * Proxy API pour récupérer la liste des groupes techniciens DSI Hub (AppDSI)
 * — utilisé par WorkflowEditorTable pour choisir le groupe destinataire d'une
 * tâche d'onboarding de type "Tâche DSI Hub". Contrairement à /api/dsihub/apps
 * (public côté AppDSI), cette route liste des données internes (groupes de
 * techniciens) et nécessite donc une clé API (DSIHUB_API_KEY, /parametres).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const urlParam = await prismaLocal.parametre.findUnique({ where: { cle: 'DSIHUB_API_URL' } })
    const keyParam = await prismaLocal.parametre.findUnique({ where: { cle: 'DSIHUB_API_KEY' } })
    const dsihubBaseUrl = urlParam?.valeur || 'http://10.103.130.106:3001/api'
    const apiKey = keyParam?.valeur

    if (!apiKey) {
      return NextResponse.json({ error: "Clé API DSIHub non configurée (paramètre DSIHUB_API_KEY)" }, { status: 400 })
    }

    const endpoint = `${dsihubBaseUrl.replace(/\/+$/, '')}/tasks/ticket-groups`
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'x-api-key': apiKey },
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error')
      return NextResponse.json({ error: `Erreur AppDSI (${res.status})`, message: errorText }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 })
  }
}
