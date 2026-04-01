import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function getParam(cle: string) {
  const p = await prisma.parametre.findUnique({ where: { cle } })
  return p?.valeur ?? ''
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { action, searchTerm } = await req.json()

    const tenantId     = await getParam('AZURE_TENANT')
    const clientId     = await getParam('AZURE_CLIENT')
    const clientSecret = await getParam('AZURE_SECRET')

    if (!tenantId || !clientId || !clientSecret) {
      return NextResponse.json({ ok: false, message: 'Configuration Entra incomplète (Tenant, Client ID ou Secret manquant).' })
    }

    // Step 1: Get access token via client_credentials
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
    const body = new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     clientId,
      client_secret: clientSecret,
      scope:         'https://graph.microsoft.com/.default',
    })

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok || !tokenData.access_token) {
      const errMsg = tokenData?.error_description || tokenData?.error || 'Token refusé par Microsoft.'
      return NextResponse.json({ ok: false, message: `Entra OAuth2 : ${errMsg}` })
    }

    if (action === 'search') {
      const term = searchTerm || ''
      const filter = term
        ? `$filter=startsWith(displayName,'${term}') or startsWith(mail,'${term}')`
        : '$top=5'

      const graphRes = await fetch(`https://graph.microsoft.com/v1.0/users?${filter}&$select=displayName,mail,userPrincipalName,accountEnabled`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })
      const graphData = await graphRes.json()

      if (!graphRes.ok) {
        return NextResponse.json({ ok: false, message: `Graph API : ${graphData?.error?.message}` })
      }

      return NextResponse.json({
        ok: true,
        message: `${graphData.value?.length ?? 0} utilisateur(s) trouvé(s) dans Entra.`,
        results: graphData.value?.map((u: any) => ({
          nom: u.displayName,
          mail: u.mail || u.userPrincipalName,
          actif: u.accountEnabled,
        })),
      })
    }

    return NextResponse.json({ ok: true, message: 'Connexion Microsoft Graph réussie (token OAuth2 OK).' })

  } catch (err: any) {
    return NextResponse.json({ ok: false, message: `Erreur technique : ${err?.message || err}` })
  }
}
