import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectAd } from '@/lib/ad-direct'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let client: any = null
  try {
    const conn = await connectAd()
    client = conn.client
    const { baseDn } = conn

    const { searchEntries } = await client.search(baseDn, {
      scope: 'sub',
      filter: '(objectClass=organizationalUnit)',
      attributes: ['dn', 'ou', 'name'],
    })

    const ous = (searchEntries as any[])
      .map(entry => {
        const dn = String(entry.dn || '')
        const name = String(entry.ou || entry.name || dn.split(',')[0]?.replace(/^OU=/i, '') || dn)
        return { dn, name }
      })
      .filter(o => o.dn)
      .sort((a, b) => a.dn.localeCompare(b.dn))

    return NextResponse.json({ ous })
  } catch (err: any) {
    console.error('[API-AD-OUS-ERROR]', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  } finally {
    await client?.unbind?.().catch(() => {})
  }
}
