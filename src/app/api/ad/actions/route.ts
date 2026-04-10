import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const { action, samAccount, samAccounts, agentId, reason } = body

    // Support both single and multiple accounts
    const targetAccounts = Array.isArray(samAccounts) ? samAccounts : (samAccount ? [samAccount] : [])

    if (targetAccounts.length === 0) return NextResponse.json({ error: 'samAccount manquant' }, { status: 400 })

    switch (action) {
      case 'ignore':
        for (const account of targetAccounts) {
          await (prisma as any).adExclusion.upsert({
            where: { sam_account: account },
            update: { reason: reason || 'Non spécifié' },
            create: { sam_account: account, reason: reason || 'Non spécifié' }
          })
        }
        break

      case 'remove-ignore':
        await (prisma as any).adExclusion.deleteMany({
          where: { sam_account: { in: targetAccounts } }
        })
        break

      case 'link':
        if (!agentId) return NextResponse.json({ error: 'agentId manquant' }, { status: 400 })
        
        // On vérifie si l'agent a déjà un compte AD lié
        const agent = await prisma.refAgent.findUnique({
            where: { id: Number(agentId) }
        })
        
        if (!agent) return NextResponse.json({ error: 'Agent introuvable' }, { status: 404 })

        if (!agent.ad_id) {
          // Premier lien : On remplit ad_id
          await prisma.refAgent.update({
            where: { id: agent.id },
            data: { ad_id: samAccount }
          })
        } else if (agent.ad_id === samAccount) {
          // Déjà lié en tant que compte principal
        } else {
          // Lien secondaire : On utilise la table ExtraAdLink
          await (prisma as any).extraAdLink.upsert({
            where: { sam_account: samAccount },
            update: { agent_id: agent.id },
            create: { sam_account: samAccount, agent_id: agent.id }
          })
        }
        break

      default:
        return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[API-AD-ACTIONS-ERROR]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
