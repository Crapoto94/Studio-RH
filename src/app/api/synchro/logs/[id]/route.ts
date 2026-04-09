import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: idParam } = await params
    const id = parseInt(idParam)

    const logs = await prisma.syncAgentLog.findMany({
      where: { synchro_id: id },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('API Synchro Logs Details Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
