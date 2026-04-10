process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

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
    const type   = searchParams.get('type')   || 'rh'     // 'rh' | 'hierarchie'
    const source = searchParams.get('source') || 'oracle'  // 'oracle' | 'postgres' | 'sqlite'

    // ── SQLite : lister les tables ──────────────────────────────────────────
    if (source === 'sqlite') {
      try {
        const tables: any[] = await (prismaLocal as any).$queryRawUnsafe(
          `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name ASC`
        )
        return NextResponse.json({ data: tables.map((t: any) => t.name) })
      } catch (e: any) {
        return NextResponse.json({ error: `Erreur SQLite: ${e.message}` }, { status: 500 })
      }
    }

    // ── PostgreSQL : lister les tables du schéma courant ───────────────────
    if (source === 'postgres') {
      try {
        const tables: any[] = await (prisma as any).$queryRawUnsafe(
          `SELECT table_name as name FROM information_schema.tables 
           WHERE table_schema = current_schema() AND table_type = 'BASE TABLE'
           ORDER BY table_name ASC`
        )
        return NextResponse.json({ data: tables.map((t: any) => t.name) })
      } catch (e: any) {
        return NextResponse.json({ error: `Erreur PostgreSQL: ${e.message}` }, { status: 500 })
      }
    }

    // ── Oracle (API Ville) : lister les vues ───────────────────────────────
    // Les paramètres de connexion sont dans SQLite (prismaLocal)
    const params = await prismaLocal.parametre.findMany()
    const config = Object.fromEntries(params.map(p => [p.cle, p.valeur]))

    const apiUrl = config['API_ASTRE_URL'] || config['API_VILLE_URL']
    const apiKey = config['API_ASTRE_KEY'] || config['API_VILLE_TOKEN']

    const mockViews = type === 'rh'
      ? ['V_AGENT_RH_FULL', 'V_AGENT_CONTRATS', 'V_AGENT_COORDONNEES']
      : ['V_HIERARCHIE_FLAT', 'V_HIERARCHIE_SERVICES', 'V_HIERARCHIE_SECTEURS']

    if (!apiUrl) {
      return NextResponse.json({ data: mockViews, note: "API Ville non configurée — données exemples" })
    }

    try {
      let base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
      const urlObj = new URL(base)
      if (!urlObj.pathname.toLowerCase().startsWith('/api')) {
        base += '/api'
      }
      const targetUrl = `${base}/v1/oracle/query`

      // Requête Oracle pour lister les vues du schéma RH
      const sql = type === 'rh'
        ? "SELECT object_name as NAME FROM all_objects WHERE object_type IN ('VIEW','TABLE') AND owner = 'RH' ORDER BY object_name ASC"
        : "SELECT object_name as NAME FROM all_objects WHERE object_type IN ('VIEW','TABLE') AND owner = 'RH' AND object_name LIKE '%HIER%' ORDER BY object_name ASC"

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey || '',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ type: 'RH', sql }),
        signal: AbortSignal.timeout(6000)
      })

      if (res.ok) {
        const result = await res.json()
        const views = Array.isArray(result)
          ? result.map((r: any) => r.NAME || r.name || r.OBJECT_NAME).filter(Boolean)
          : []
        if (views.length > 0) {
          return NextResponse.json({ data: views })
        }
        console.warn('[sql/views] API Oracle OK mais aucune vue retournée')
      } else {
        const errText = await res.text()
        console.warn(`[sql/views] API Oracle ${res.status}: ${errText}`)
      }
    } catch (e: any) {
      console.warn('[sql/views] Erreur appel API Oracle:', e.message)
      return NextResponse.json({
        data: mockViews,
        note: `API injoignable (${e.message}) — données exemples`
      })
    }

    return NextResponse.json({ data: mockViews, note: "API Oracle injoignable — données exemples" })

  } catch (error) {
    console.error('[sql/views] Erreur interne:', error)
    return NextResponse.json({ error: 'Erreur interne serveur' }, { status: 500 })
  }
}
