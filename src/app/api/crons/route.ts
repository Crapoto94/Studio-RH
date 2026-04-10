import { NextRequest, NextResponse } from 'next/server'
import { prismaLocal } from '@/lib/db'
import { cronManager } from '@/lib/cronManager'

export async function GET() {
  try {
    const crons = await prismaLocal.cronJob.findMany({
      orderBy: { created_at: 'desc' },
    })
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

    const cron = await prismaLocal.cronJob.create({
      data: {
        name,
        type,
        schedule,
        schedule_type,
        is_active: true
      }
    })

    // Reload crons in memory
    cronManager.reload()

    return NextResponse.json(cron)
  } catch (error) {
    console.error('API Crons POST Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
