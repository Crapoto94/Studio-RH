import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const roles = await prisma.appRole.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(roles)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, permissions } = await req.json()
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const role = await prisma.appRole.create({
      data: { name, permissions: JSON.stringify(permissions || []) }
    })
    return NextResponse.json(role)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, name, permissions } = await req.json()
    if (!id || !name) return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 })
    
    if (name === 'admin') {
      // Pour protéger le nom s'il est utilisé de manière globale, mais on peut autoriser l'update des permissions
    }
    
    const role = await prisma.appRole.update({
      where: { id: Number(id) },
      data: { name, permissions: JSON.stringify(permissions || []) }
    })
    return NextResponse.json(role)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await prisma.appRole.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
