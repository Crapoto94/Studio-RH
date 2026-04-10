process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, prismaLocal } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const params = await prismaLocal.parametre.findMany()
    const config = Object.fromEntries(params.map(p => [p.cle, p.valeur]))

    const apiUrl = config['API_ASTRE_URL'] || config['API_VILLE_URL']
    const apiKey = config['API_ASTRE_KEY'] || config['API_VILLE_TOKEN']

    if (!apiUrl) {
      return NextResponse.json({ ok: false, message: 'URL API non configurée' })
    }

    // Ping the API using Oracle query with CORRECT BODY FORMAT
    try {
      let base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
      // Ensure /api segment is present if missing from path (ignoring the 'api-dev' in hostname)
      const urlObj = new URL(base)
      if (!urlObj.pathname.toLowerCase().startsWith('/api')) {
        base += '/api'
      }
      const targetUrl = `${base}/v1/oracle/query`
      
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey || '',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          type: 'RH', 
          sql: 'SELECT 1 FROM DUAL' 
        }),
        signal: AbortSignal.timeout(5000)
      })

      if (res.ok) {
        return NextResponse.json({ ok: true, message: 'Connexion à l\'API et à Oracle réussie' })
      } else {
        const errorText = await res.text()
        return NextResponse.json({ 
          ok: false, 
          message: `L'API a répondu avec l'erreur: ${res.status} ${res.statusText}. URL tentée: ${targetUrl}` 
        })
      }
    } catch (e: any) {
      console.error('Fetch Test Astre Failed:', e)
      return NextResponse.json({ ok: false, message: `Erreur lors de l'appel API: ${e.message} ${e.cause ? '(Cause: ' + e.cause.message + ')' : ''}` })
    }

  } catch (error) {
    console.error('API Test Astre Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
