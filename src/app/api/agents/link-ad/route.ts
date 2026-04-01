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

    const { agentId, adId } = await req.json()
    if (!agentId) return NextResponse.json({ error: 'Agent manquant' }, { status: 400 })

    await prisma.$executeRaw`UPDATE "REF_AGENTS" SET ad_id = ${adId || null} WHERE id = ${agentId}`

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
