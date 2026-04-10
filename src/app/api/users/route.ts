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
    const users = await prisma.appUser.findMany({
       select: {
          id: true,
          login: true,
          nom: true,
          prenom: true,
          role: true,
          is_ad: true,
          actif: true,
          created_at: true
       },
       orderBy: { login: 'asc' }
    })
    return NextResponse.json(users)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { id, role, actif, password } = body
    
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    
    const updateData: any = {}
    if (role !== undefined) updateData.role = role
    if (actif !== undefined) updateData.actif = actif
    if (password !== undefined) updateData.password = password

    const user = await prisma.appUser.update({
      where: { id: Number(id) },
      data: updateData,
      select: { id: true, login: true, role: true, actif: true }
    })
    return NextResponse.json(user)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { login, nom, prenom, role, is_ad } = await req.json()
    if (!login) return NextResponse.json({ error: 'Login is required' }, { status: 400 })

    const existing = await prisma.appUser.findUnique({ where: { login } })
    if (existing) {
       return NextResponse.json({ error: 'L\'utilisateur existe déjà.' }, { status: 400 })
    }

    const user = await prisma.appUser.create({
      data: {
        login,
        password: '',
        nom: nom || login,
        prenom: prenom || '',
        role: role || 'user',
        is_ad: is_ad !== undefined ? is_ad : true,
        actif: true
      }
    })
    return NextResponse.json(user)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
