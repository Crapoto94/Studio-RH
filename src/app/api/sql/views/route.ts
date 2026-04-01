process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'rh' // 'rh' or 'hierarchie'

    const params = await prisma.parametre.findMany()
    const config = Object.fromEntries(params.map(p => [p.cle, p.valeur]))

    const apiUrl = config['API_ASTRE_URL'] || config['API_VILLE_URL']
    const apiKey = config['API_ASTRE_KEY'] || config['API_VILLE_TOKEN']

    // Mock data for fallback
    const mockViews = type === 'rh' 
        ? ['V_AGENT_RH_FULL', 'V_AGENT_CONTRATS', 'V_AGENT_COORDONNEES']
        : ['V_HIERARCHIE_FLAT', 'V_HIERARCHIE_SERVICES', 'V_HIERARCHIE_SECTEURS']

    if (!apiUrl) {
       return NextResponse.json({ data: mockViews, note: "API non configurée" })
    }

    try {
        let base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
        // Ensure /api segment is present if missing from path (ignoring the 'api-dev' in hostname)
        const urlObj = new URL(base)
        if (!urlObj.pathname.toLowerCase().startsWith('/api')) {
          base += '/api'
        }
        const targetUrl = `${base}/v1/oracle/query`
        
        // Oracle metadata query with CORRECT BODY FORMAT
        const sql = "SELECT view_name as NAME FROM all_views WHERE owner = 'RH' ORDER BY view_name ASC"

        const res = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey || '',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
              type: 'RH', 
              sql: sql 
            }),
            signal: AbortSignal.timeout(5000)
        })

        if (res.ok) {
            const result = await res.json()
            // Result is expected as an array of objects [{NAME: '...'}, ...]
            const views = Array.isArray(result) ? result.map((r: any) => r.NAME || r.name) : []
            if (views.length > 0) {
                return NextResponse.json({ data: views })
            }
        } else {
            console.warn(`API responded with ${res.status} for views list`)
        }
    } catch (e: any) {
        console.warn('API call for views failed:', e)
        return NextResponse.json({ data: mockViews, note: `Erreur API: ${e.message} ${e.cause ? '(' + e.cause.message + ')' : ''}` })
    }

    return NextResponse.json({ data: mockViews, note: "Données locales (API injoignable ou format incorrect)" })

  } catch (error) {
    console.error('API SQL Views GET Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
