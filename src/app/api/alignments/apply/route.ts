import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, prismaLocal } from '@/lib/db'
import { Client, Change, Attribute } from 'ldapts'
import { resolveLdapAttribute } from '@/lib/ad-fields'

async function getParam(cle: string) {
  const p = await prismaLocal.parametre.findUnique({ where: { cle } })
  return p?.valeur ?? ''
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()
    const { agents } = body

    if (!agents || !Array.isArray(agents) || agents.length === 0) {
      return NextResponse.json({ error: 'Aucun agent sélectionné' }, { status: 400 })
    }

    const url = (await getParam('AD_SERVER_URL')) || (await getParam('AD_SERVER'))
    const port = parseInt((await getParam('AD_PORT')) || '389', 10)
    const dn = (await getParam('AD_SRV_ACCOUNT')) || (await getParam('AD_USER'))
    const pass = (await getParam('AD_SRV_PASSWORD')) || (await getParam('AD_PASSWORD'))
    const matriculeAttr = (await getParam('AD_ATTRIBUTE_MATRICULE')) || 'employeeID'

    if (!url || !dn || !pass) {
      return NextResponse.json({ error: "Configuration AD incomplète. Vérifiez l'URL, l'identifiant et le mot de passe dans les paramètres." }, { status: 400 })
    }

    const ldapUrl = url.startsWith('ldap') ? url : `ldap://${url}`
    const client = new Client({
      url: `${ldapUrl.replace(/:\d+$/, '')}:${port}`,
      timeout: 10000,
      connectTimeout: 5000,
    })

    const results: Array<{ ad_id: string; nom: string; success: boolean; message: string; skippedFields?: string[] }> = []

    try {
      await client.bind(dn, pass)

      for (const agent of agents) {
        const { ad_id, diffs, nom, prenom } = agent
        const label = `${nom || ''} ${prenom || ''}`.trim() || ad_id
        if (!ad_id || !diffs || diffs.length === 0) continue

        try {
          // Résolution du DN via la table BRUT_AD, avec fallback par recherche LDAP directe
          let targetDn: string | null = null
          const brutAdEntry = await prisma.brutAd.findFirst({ where: { sam_account: ad_id } })
          targetDn = brutAdEntry?.distinguished_name || null

          if (!targetDn) {
            const baseDN = await getParam('AD_BASE_DN')
            const { searchEntries } = await client.search(baseDN, {
              scope: 'sub',
              filter: `(sAMAccountName=${ad_id})`,
              sizeLimit: 1,
              attributes: ['dn'],
            })
            if (searchEntries.length > 0) targetDn = String(searchEntries[0].dn)
          }

          if (!targetDn) {
            results.push({ ad_id, nom: label, success: false, message: 'Compte introuvable dans AD (DN non résolu).' })
            continue
          }

          const changes: Change[] = []
          const skippedFields: string[] = []

          for (const d of diffs) {
            const ldapAttr = resolveLdapAttribute(d.fieldAd, matriculeAttr)
            if (!ldapAttr) {
              skippedFields.push(d.fieldAd)
              continue
            }
            changes.push(new Change({
              operation: 'replace',
              modification: new Attribute({ type: ldapAttr, values: [d.valRh || ''] }),
            }))
          }

          if (changes.length === 0) {
            results.push({ ad_id, nom: label, success: false, message: 'Aucun champ modifiable directement.', skippedFields })
            continue
          }

          await client.modify(targetDn, changes)
          results.push({ ad_id, nom: label, success: true, message: `${changes.length} attribut(s) mis à jour.`, skippedFields: skippedFields.length ? skippedFields : undefined })
        } catch (err: any) {
          results.push({ ad_id, nom: label, success: false, message: err?.message || String(err) })
        }
      }
    } finally {
      await client.unbind().catch(() => {})
    }

    const successCount = results.filter(r => r.success).length
    return NextResponse.json({
      ok: true,
      successCount,
      failureCount: results.length - successCount,
      results,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 })
  }
}
