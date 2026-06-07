import { NextRequest, NextResponse } from 'next/server'
import { prismaLocal } from '@/lib/db'
import { cronManager } from '@/lib/cronManager'

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, newOrder } = body

    if (id === undefined || newOrder === undefined) {
      return NextResponse.json({ error: 'Missing id or newOrder' }, { status: 400 })
    }

    const current = await prismaLocal.cronJob.findUnique({ where: { id: Number(id) } })
    if (!current) {
      return NextResponse.json({ error: 'Cron not found' }, { status: 404 })
    }

    const delta = newOrder > current.sort_order ? 1 : -1

    await prismaLocal.$transaction([
      prismaLocal.cronJob.updateMany({
        where: {
          sort_order: delta === 1
            ? { gt: current.sort_order, lte: newOrder }
            : { gte: newOrder, lt: current.sort_order }
        },
        data: { sort_order: { decrement: delta } }
      }),
      prismaLocal.cronJob.update({
        where: { id: Number(id) },
        data: { sort_order: newOrder }
      }),
    ])

    cronManager.reload()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Crons Reorder Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
