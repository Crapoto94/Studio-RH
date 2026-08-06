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

    const { query, source } = await req.json()
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Requête vide ou invalide' }, { status: 400 })
    }

    // ── Oracle via l'API Ville ──────────────────────────────────────────────
    if (source === 'oracle') {
      const params = await prismaLocal.parametre.findMany()
      const config = Object.fromEntries(params.map(p => [p.cle, p.valeur]))
      const apiUrl = config['API_VILLE_URL'] || config['API_ASTRE_URL']
      const apiKey = config['API_VILLE_TOKEN'] || config['API_ASTRE_KEY']

      if (!apiUrl) {
        return NextResponse.json({ error: 'API Ville non configurée (API_VILLE_URL manquant)' }, { status: 503 })
      }

      let base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
      const urlObj = new URL(base)
      if (!urlObj.pathname.toLowerCase().startsWith('/api')) base += '/api'
      const targetUrl = `${base}/v1/oracle/query`

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'x-api-key': apiKey || '', 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'RH', sql: query }),
        signal: AbortSignal.timeout(15000)
      })

      if (!res.ok) {
        const errText = await res.text()
        return NextResponse.json({ error: `API Oracle ${res.status}: ${errText}` }, { status: res.status })
      }

      const result = await res.json()
      const rows = Array.isArray(result) ? result : []
      return NextResponse.json({ success: true, count: rows.length, data: rows })
    }

    // ── SQLite ──────────────────────────────────────────────────────────────
    if (source === 'local' || source === 'sqlite') {
      console.log(`[SQL] SQLite query:`, query)
      const result = await (prismaLocal as any).$queryRawUnsafe(query)
      const rows = Array.isArray(result) ? result : []
      return NextResponse.json({ success: true, count: rows.length, data: rows })
    }

    // ── PostgreSQL (default) ────────────────────────────────────────────────
    console.log(`[SQL] PostgreSQL query:`, query)
    const result = await (prisma as any).$queryRawUnsafe(query)
    const rows = Array.isArray(result) ? result : []
    return NextResponse.json({ success: true, count: rows.length, data: rows })

  } catch (error: any) {
    console.error('[SQL] Erreur:', error)
    let msg = error.message || 'Erreur inconnue'
    if (msg.includes('no such table')) {
      msg += '. Vérifiez le nom de la table (utilisez des guillemets doubles pour PostgreSQL).'
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
