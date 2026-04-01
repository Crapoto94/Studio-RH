import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const { page, limit } = querySchema.parse(Object.fromEntries(searchParams))

    const [logs, total] = await Promise.all([
      prisma.smsLog.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { sent_at: 'desc' },
      }),
      prisma.smsLog.count(),
    ])

    return NextResponse.json({
      data: logs,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error('API SMS Logs GET Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
