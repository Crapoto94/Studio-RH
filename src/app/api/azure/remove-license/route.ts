import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, prismaLocal } from '@/lib/db'

async function getParam(cle: string) {
  const p = await prismaLocal.parametre.findUnique({ where: { cle } })
  return p?.valeur ?? ''
}

const GRAPH = 'https://graph.microsoft.com/v1.0'

/**
 * Retire toutes les licences Microsoft 365 des comptes Azure fournis,
 * via Microsoft Graph (POST /users/{id}/assignLicense avec removeLicenses).
 * Nécessite la permission applicative LicenseAssignment.ReadWrite.All.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const users: Array<{ azureId?: string; upn?: string }> = Array.isArray(body?.users) ? body.users : []

    if (users.length === 0) {
      return NextResponse.json({ error: 'Aucun compte sélectionné' }, { status: 400 })
    }

    const tenantId = (await getParam('AZURE_TENANT_ID')) || (await getParam('AZURE_TENANT'))
    const clientId = (await getParam('AZURE_CLIENT_ID')) || (await getParam('AZURE_CLIENT'))
    const clientSecret = (await getParam('AZURE_CLIENT_SECRET')) || (await getParam('AZURE_SECRET'))

    if (!tenantId || !clientId || !clientSecret) {
      return NextResponse.json({ error: 'Configuration Entra incomplète (Tenant, Client ID ou Secret manquant).' }, { status: 400 })
    }

    // 1. Token applicatif
    const tokenRes = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
      }).toString(),
      signal: AbortSignal.timeout(15000),
    })
    const tokenData: any = await tokenRes.json()
    if (!tokenRes.ok || !tokenData.access_token) {
      const errMsg = tokenData?.error_description || tokenData?.error || 'Token refusé par Microsoft.'
      return NextResponse.json({ error: `Entra OAuth2 : ${errMsg}` }, { status: 502 })
    }
    const token = tokenData.access_token as string
    const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

    const results: Array<{ upn: string; success: boolean; removed: number; message: string }> = []

    for (const user of users) {
      const key = user.azureId || user.upn || ''
      const label = user.upn || key
      if (!key) {
        results.push({ upn: label, success: false, removed: 0, message: 'Identifiant Azure manquant.' })
        continue
      }

      try {
        // 2. Licences actuellement assignées
        const userRes = await fetch(`${GRAPH}/users/${encodeURIComponent(key)}?$select=id,userPrincipalName,assignedLicenses`, {
          headers: authHeaders,
          signal: AbortSignal.timeout(20000),
        })
        const userData: any = await userRes.json()
        if (!userRes.ok) {
          results.push({ upn: label, success: false, removed: 0, message: userData?.error?.message || `HTTP ${userRes.status}` })
          continue
        }

        const skuIds: string[] = (userData.assignedLicenses || []).map((l: any) => l.skuId).filter(Boolean)
        if (skuIds.length === 0) {
          results.push({ upn: label, success: true, removed: 0, message: 'Aucune licence à retirer.' })
          continue
        }

        // 3. Retrait des licences
        const assignRes = await fetch(`${GRAPH}/users/${encodeURIComponent(key)}/assignLicense`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ addLicenses: [], removeLicenses: skuIds }),
          signal: AbortSignal.timeout(30000),
        })

        if (!assignRes.ok) {
          const assignData: any = await assignRes.json().catch(() => ({}))
          results.push({ upn: label, success: false, removed: 0, message: assignData?.error?.message || `HTTP ${assignRes.status}` })
          continue
        }

        // 4. Refléter localement
        const upn = String(userData.userPrincipalName || label)
        await prisma.brutAzure.updateMany({
          where: { OR: [{ azure_id: key }, { user_principal_name: upn }] },
          data: { licenses: '[]' },
        })
        await prisma.refAgent.updateMany({
          where: { azure_id: upn },
          data: { licence: '[]' },
        })

        results.push({ upn, success: true, removed: skuIds.length, message: `${skuIds.length} licence(s) retirée(s).` })
      } catch (err: any) {
        results.push({ upn: label, success: false, removed: 0, message: err?.message || String(err) })
      }
    }

    const successCount = results.filter(r => r.success).length
    return NextResponse.json({
      ok: true,
      successCount,
      failureCount: results.length - successCount,
      results,
    })
  } catch (err: any) {
    console.error('[API-AZURE-REMOVE-LICENSE-ERROR]', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
