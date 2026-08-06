import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { runBrutSync } from '@/lib/sync'

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

    const result = await runBrutSync()
    return NextResponse.json(result)
  } catch (error) {
    console.error('API Synchro Brut Error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
