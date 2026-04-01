import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const getLogsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const query = getLogsSchema.parse(Object.fromEntries(searchParams))

    const logs = await prisma.$queryRawUnsafe(`
      SELECT * FROM "SYNCHRO_LOGS" 
      ORDER BY created_at DESC 
      LIMIT ?
    `, query.limit)

    return NextResponse.json(logs)
  } catch (error) {
    console.error('API Synchro Logs GET Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
