import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // We fetch the flat active hierarchy list, which the front-end will build into a tree.
    // In production we usually filter by "active" structures using the latest snapshot 
    // or plus_vu field of hierarchical structures. For now we just return all.
    const hierarchie = await prisma.refHierarchie.findMany({
      orderBy: { id: 'asc' },
    })

    return NextResponse.json(hierarchie)
  } catch (error) {
    console.error('API Hierarchie GET Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
