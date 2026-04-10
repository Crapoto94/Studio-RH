import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, prismaLocal } from '@/lib/db'
import { Client } from 'ldapts'

// Fetch a stored parametre
async function getParam(cle: string) {
  const p = await prismaLocal.parametre.findUnique({ where: { cle } })
  return p?.valeur ?? ''
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { action, searchTerm } = await req.json()

    const url    = await getParam('AD_SERVER_URL') || await getParam('AD_SERVER')
    const port   = parseInt(await getParam('AD_PORT') || '389', 10)
    const baseDN = await getParam('AD_BASE_DN')
    const dn     = await getParam('AD_SRV_ACCOUNT') || await getParam('AD_USER')
    const pass   = await getParam('AD_SRV_PASSWORD') || await getParam('AD_PASSWORD')

    if (!url || !dn || !pass) {
      return NextResponse.json({ ok: false, message: 'Configuration AD incomplète. Vérifiez l\'URL, l\'identifiant et le mot de passe.' })
    }

    // Build LDAP URL
    const ldapUrl = url.startsWith('ldap') ? url : `ldap://${url}`
    const client = new Client({
      url: `${ldapUrl.replace(/:\d+$/, '')}:${port}`,
      timeout: 5000,
      connectTimeout: 5000,
    })

    // Test: BIND
    await client.bind(dn, pass)

    if (action === 'search') {
      const term = searchTerm || '*'
      const { searchEntries } = await client.search(baseDN, {
        scope: 'sub',
        filter: `(|(sAMAccountName=*${term}*)(displayName=*${term}*)(mail=*${term}*))`,
        sizeLimit: 5,
        attributes: ['sAMAccountName', 'displayName', 'mail', 'department'],
      })
      await client.unbind()
      return NextResponse.json({
        ok: true,
        message: `${searchEntries.length} résultat(s) trouvé(s).`,
        results: searchEntries.map((e: any) => ({
          login: e.sAMAccountName,
          nom: e.displayName,
          mail: e.mail,
          service: e.department,
        })),
      })
    }

    await client.unbind()
    return NextResponse.json({ ok: true, message: 'Connexion LDAP réussie (bind OK).' })

  } catch (err: any) {
    const msg = err?.message || String(err)
    return NextResponse.json({ ok: false, message: `Erreur LDAP : ${msg}` })
  }
}
