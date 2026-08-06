import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, prismaLocal } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const source = searchParams.get('source') || 'postgres' // 'postgres' | 'sqlite' | 'oracle'

    // ── SQLite ─────────────────────────────────────────────────────────────
    if (source === 'sqlite' || source === 'local') {
      const tablesRaw = await prismaLocal.$queryRawUnsafe<any[]>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC"
      )
      return NextResponse.json({ data: tablesRaw.map(t => t.name), source: 'sqlite' })
    }

    // ── PostgreSQL ──────────────────────────────────────────────────────────
    if (source === 'postgres' || source === 'main') {
      const schemaParam = await prismaLocal.parametre.findFirst({ where: { cle: 'PG_SCHEMA' } })
      const schema = schemaParam?.valeur || 'public'
      const tablesRaw = await prisma.$queryRawUnsafe<any[]>(`
        SELECT table_name as name 
        FROM information_schema.tables 
        WHERE table_schema = $1
        AND table_type = 'BASE TABLE'
        ORDER BY table_name ASC
      `, schema)
      return NextResponse.json({ data: tablesRaw.map(t => t.name), source: 'postgres', schema })
    }

    // ── Oracle (API Ville) ──────────────────────────────────────────────────
    if (source === 'oracle') {
      const params = await prismaLocal.parametre.findMany()
      const config = Object.fromEntries(params.map(p => [p.cle, p.valeur]))
      const apiUrl = config['API_VILLE_URL'] || config['API_ASTRE_URL']
      const apiKey = config['API_VILLE_TOKEN'] || config['API_ASTRE_KEY']

      if (!apiUrl) {
        return NextResponse.json({ 
          data: ['V_AGENT_CONTRATS', 'V_AGENT_RH_FULL', 'V_HIERARCHIE_FLAT'], 
          source: 'oracle',
          note: 'API Ville non configurée — données exemples'
        })
      }

      try {
        let base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
        const urlObj = new URL(base)
        if (!urlObj.pathname.toLowerCase().startsWith('/api')) base += '/api'
        const targetUrl = `${base}/v1/oracle/query`

        const sql = "SELECT object_name as NAME, object_type as TYPE FROM all_objects WHERE object_type IN ('VIEW','TABLE') AND owner = 'RH' ORDER BY object_type, object_name ASC"

        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'x-api-key': apiKey || '', 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'RH', sql }),
          signal: AbortSignal.timeout(6000)
        })

        if (res.ok) {
          const result = await res.json()
          const items = Array.isArray(result)
            ? result.map((r: any) => ({ name: r.NAME || r.name, type: r.TYPE || r.type }))
            : []
          if (items.length > 0) {
            return NextResponse.json({ data: items.map((i: any) => i.name), source: 'oracle' })
          }
        } else {
          const errText = await res.text()
          console.warn(`[sql/tables] Oracle API ${res.status}: ${errText}`)
        }
      } catch (e: any) {
        console.warn('[sql/tables] Oracle API unreachable:', e.message)
        return NextResponse.json({
          data: ['V_AGENT_CONTRATS', 'V_AGENT_RH_FULL', 'V_HIERARCHIE_FLAT'],
          source: 'oracle',
          note: `API injoignable (${e.message})`
        })
      }
    }

    return NextResponse.json({ data: [], source, note: 'Source inconnue ou API sans résultat' })

  } catch (error) {
    console.error('[sql/tables] Erreur:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
