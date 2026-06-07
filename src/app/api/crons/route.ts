import { NextRequest, NextResponse } from 'next/server'
import { prismaLocal } from '@/lib/db'
import { cronManager } from '@/lib/cronManager'

export async function GET() {
  try {
    // Use raw SQL to avoid Prisma schema validation when sort_order column is missing
    let crons: any
    try {
      crons = await prismaLocal.$queryRawUnsafe(
        `SELECT id, name, type, schedule, schedule_type, sort_order, is_active, last_run, next_run, created_at, updated_at
         FROM "CRON_JOBS" ORDER BY sort_order ASC, created_at DESC`
      )
    } catch {
      crons = await prismaLocal.$queryRawUnsafe(
        `SELECT id, name, type, schedule, schedule_type, NULL AS sort_order, is_active, last_run, next_run, created_at, updated_at
         FROM "CRON_JOBS" ORDER BY created_at DESC`
      )
    }
    return NextResponse.json(crons)
  } catch (error) {
    console.error('API Crons GET Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
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
      const rows: any = await prismaLocal.$queryRawUnsafe(
        `SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM "CRON_JOBS"`
      )
      nextOrder = Number(rows[0]?.next_order ?? 0)
    } catch {
      const rows: any = await prismaLocal.$queryRawUnsafe(
        `SELECT COUNT(*) AS cnt FROM "CRON_JOBS"`
      )
      nextOrder = Number(rows[0]?.cnt ?? 0)
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
