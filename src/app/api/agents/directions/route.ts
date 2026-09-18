import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const directions = await prisma.refAgent.findMany({
      select: { nom_direction: true },
      distinct: ['nom_direction'],
      where: { nom_direction: { not: null } },
      orderBy: { nom_direction: 'asc' }
    })

    return NextResponse.json(directions.map(d => d.nom_direction).filter(Boolean))
  } catch (error) {
    console.error('API Directions GET Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
