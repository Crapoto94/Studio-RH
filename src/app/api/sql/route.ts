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

    const { query } = await req.json()
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Requête vide ou invalide' }, { status: 400 })
    }

    // Avertissement: `prisma.$queryRawUnsafe` est très dangereux en prod,
    // mais c'est spécifiquement demandé pour l'explorateur SQL admin (DSI interne)
    const result = await prisma.$queryRawUnsafe(query)

    return NextResponse.json({ success: true, count: Array.isArray(result) ? result.length : 0, data: result })
  } catch (error) {
    console.error('API SQL Query Error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
