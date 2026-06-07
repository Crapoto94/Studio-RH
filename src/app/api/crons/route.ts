import { NextRequest, NextResponse } from 'next/server'
import { prismaLocal } from '@/lib/db'
import { cronManager } from '@/lib/cronManager'

export async function GET() {
  try {
    const crons = await prismaLocal.cronJob.findMany({
      orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }],
    })
    return NextResponse.json(crons)
  } catch (error) {
    console.warn('API Crons GET Error (fallback to created_at):', (error as any)?.message)
    try {
      const crons = await prismaLocal.cronJob.findMany({
        orderBy: { created_at: 'desc' },
      })
      return NextResponse.json(crons)
    } catch (fallbackErr) {
      console.error('API Crons GET Fallback Error:', fallbackErr)
      return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, type, schedule, schedule_type } = body

    if (!name || !type || !schedule || !schedule_type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    let nextOrder = 0
    try {
      const maxOrder = await prismaLocal.cronJob.aggregate({ _max: { sort_order: true } })
      nextOrder = (maxOrder._max.sort_order ?? -1) + 1
    } catch {
      const count = await prismaLocal.cronJob.count()
      nextOrder = count
    }

    const data: any = {
      name,
      type,
      schedule,
      schedule_type,
      is_active: true
    }
    try { data.sort_order = nextOrder } catch {}

    const cron = await prismaLocal.cronJob.create({ data })

    // Reload crons in memory
    cronManager.reload()

    return NextResponse.json(cron)
  } catch (error) {
    console.error('API Crons POST Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
