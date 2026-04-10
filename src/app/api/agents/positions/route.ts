import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const positions = await prisma.refAgent.findMany({
      select: { position_l: true },
      distinct: ['position_l'],
      where: { position_l: { not: null } },
      orderBy: { position_l: 'asc' }
    })

    return NextResponse.json(positions.map(p => p.position_l))
  } catch (error) {
    console.error('API Positions GET Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
