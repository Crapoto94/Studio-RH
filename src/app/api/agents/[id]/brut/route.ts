import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { id: idParam } = await params
    const id = parseInt(idParam)
    const agent = await prisma.refAgent.findUnique({
      where: { id },
      include: { extra_ad_links: true }
    })

    if (!agent) return NextResponse.json({ error: 'Agent introuvable' }, { status: 404 })

    const samAccounts = [
      agent.ad_id,
      ...(agent.extra_ad_links?.map(l => l.sam_account) || [])
    ].filter(Boolean) as string[]

    const [brutRh, brutAds, brutAzure] = await Promise.all([
      agent.matricule ? prisma.brutRh.findFirst({ where: { MATRICULE: agent.matricule } }) : null,
      samAccounts.length > 0 ? prisma.brutAd.findMany({ where: { sam_account: { in: samAccounts } } }) : null,
      agent.azure_id ? prisma.brutAzure.findFirst({ where: { user_principal_name: agent.azure_id } }) : null
    ])

    return NextResponse.json({ brutRh, brutAds: brutAds || [], brutAzure })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
