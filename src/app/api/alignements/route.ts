import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Fetch alignements
    const alignements = await prisma.alignment.findMany({
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(alignements)
  } catch (error) {
    console.error('API Alignements GET Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
