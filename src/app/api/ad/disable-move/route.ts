import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { connectAd, escapeLdapFilter, getRdn } from '@/lib/ad-direct'
import { Attribute, Change } from 'ldapts'

/**
 * Désactive les comptes AD sélectionnés et les déplace dans une OU cible.
 * - Désactivation : bit 0x2 de userAccountControl (ACCOUNTDISABLE)
 * - Déplacement : modifyDN vers CN=...,<OU cible>
 * Les données locales (BRUT_AD) sont mises à jour pour refléter le changement
 * sans attendre la prochaine synchro.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let client: any = null
  try {
    const body = await req.json()
    const samAccounts: string[] = Array.isArray(body?.samAccounts) ? body.samAccounts : []
    const targetOu: string = String(body?.targetOu || '').trim()

    if (samAccounts.length === 0) {
      return NextResponse.json({ error: 'Aucun compte sélectionné' }, { status: 400 })
    }
    if (!targetOu || !/^OU=/i.test(targetOu) || /[\r\n]/.test(targetOu)) {
      return NextResponse.json({ error: 'OU cible invalide' }, { status: 400 })
    }

    const conn = await connectAd()
    client = conn.client
    const { baseDn } = conn

    const results: Array<{ samAccount: string; success: boolean; message: string; newDn?: string }> = []

    for (const sam of samAccounts) {
      try {
        // Résolution du DN + de l'état courant côté AD
        const { searchEntries } = await client.search(baseDn, {
          scope: 'sub',
          filter: `(sAMAccountName=${escapeLdapFilter(sam)})`,
          sizeLimit: 1,
          attributes: ['dn', 'cn', 'userAccountControl'],
        })

        const entry: any = searchEntries[0]
        if (!entry) {
          results.push({ samAccount: sam, success: false, message: 'Compte introuvable dans AD (DN non résolu).' })
          continue
        }

        const dn = String(entry.dn)
        const currentUac = Number(entry.userAccountControl)

        // 1. Désactivation
        const newUac = (Number.isFinite(currentUac) ? currentUac : 512) | 0x2
        await client.modify(dn, new Change({
          operation: 'replace',
          modification: new Attribute({ type: 'userAccountControl', values: [String(newUac)] }),
        }))

        // 2. Déplacement vers l'OU cible
        const newDn = `${getRdn(dn)},${targetOu}`
        if (newDn.toLowerCase() !== dn.toLowerCase()) {
          await client.modifyDN(dn, newDn)
        }

        // 3. Refléter localement
        await prisma.brutAd.updateMany({
          where: { sam_account: sam },
          data: { enabled: false, distinguished_name: newDn },
        })

        results.push({ samAccount: sam, success: true, message: 'Compte désactivé et déplacé.', newDn })
      } catch (err: any) {
        results.push({ samAccount: sam, success: false, message: err?.message || String(err) })
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
    console.error('[API-AD-DISABLE-MOVE-ERROR]', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  } finally {
    await client?.unbind?.().catch(() => {})
  }
}
