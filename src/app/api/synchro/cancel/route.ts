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

    // Mark all 'en_cours' logs as 'error' (cancelled)
    const result = await prisma.synchroLog.updateMany({
      where: { statut: 'en_cours' },
      data: { 
        statut: 'error',
        message: 'Synchronisation annulée manuellement par l\'utilisateur.'
      }
    })

    await prisma.audit.create({
      data: {
        user_id: (session.user as any).id,
        action: 'synchro_cancel',
        details: `Nombre de logs annulés : ${result.count}`
      }
    })

    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    console.error('API Synchro Cancel Error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
