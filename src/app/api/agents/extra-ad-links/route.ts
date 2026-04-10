import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { agentId, adId } = await req.json()
    if (!agentId || !adId) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    await prisma.extraAdLink.upsert({
      where: { sam_account: adId },
      create: { agent_id: agentId, sam_account: adId },
      update: { agent_id: agentId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Extra AD Create Error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const agentId = parseInt(searchParams.get('agentId') || '')
    const samAccount = searchParams.get('samAccount')

    if (!agentId || !samAccount) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    await prisma.extraAdLink.delete({
      where: { sam_account: samAccount }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Extra AD Delete Error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
