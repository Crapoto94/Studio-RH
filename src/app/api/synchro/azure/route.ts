import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { runAzureSync } from '@/lib/sync'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    const isInternal = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`

    if (!isInternal) {
      const session = await getServerSession(authOptions)
      if (!session || (session.user as any)?.role !== 'admin') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }
    }

    const result = await runAzureSync()
    return NextResponse.json(result)
  } catch (error) {
    console.error('API Synchro Azure Error:', error)
    await prisma.synchroLog.create({
      data: {
        type: 'azure',
        statut: 'error',
        message: 'Erreur lors de la liaison Azure: ' + (error as Error).message
      }
    })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
