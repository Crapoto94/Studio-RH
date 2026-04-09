import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cronManager } from '@/lib/cronManager'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    const body = await req.json()

    const cron = await prisma.cronJob.update({
      where: { id },
      data: body
    })

    // Reload crons in memory
    cronManager.reload()

    return NextResponse.json(cron)
  } catch (error) {
    console.error('API Crons PATCH Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

    await prisma.cronJob.delete({
      where: { id }
    })

    // Reload crons in memory
    cronManager.reload()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Crons DELETE Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
