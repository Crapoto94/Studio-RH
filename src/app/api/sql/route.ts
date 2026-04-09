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

    console.log('[DEBUG] SQL Explorer - Query:', query)
    const result = await prisma.$queryRawUnsafe(query)
    console.log('[DEBUG] SQL Explorer - Success, Rows:', Array.isArray(result) ? result.length : 0)

    return NextResponse.json({ success: true, count: Array.isArray(result) ? result.length : 0, data: result })
  } catch (error: any) {
    console.error('API SQL Query Error:', error)
    let errorMessage = error.message
    if (errorMessage.includes('no such table')) {
      errorMessage += '. Essayez d\'utiliser des guillemets doubles (ex: "REF_AGENTS") ou vérifiez le nom de la table.'
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
