import { NextRequest, NextResponse } from 'next/server'
import { prismaLocal } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateApiKey } from '@/lib/api-auth'

function isAdmin(session: any) {
  return session && (session.user as any)?.role === 'admin'
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const keys = await prismaLocal.apiKey.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        key_prefix: true,
        permissions: true,
        expires_at: true,
        is_active: true,
        created_at: true,
        created_by: true,
      }
    })

    return NextResponse.json(keys)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const { name, permissions, expires_at } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 })
    }

    const perms = permissions === 'read_write' ? 'read_write' : 'read'

    const { raw, hash, prefix } = generateApiKey()

    await prismaLocal.apiKey.create({
      data: {
        name: name.trim(),
        key_hash: hash,
        key_prefix: prefix,
        permissions: perms,
        expires_at: expires_at ? new Date(expires_at) : null,
        created_by: (session!.user as any).email || 'admin',
      }
    })

    return NextResponse.json({
      message: 'Clé API créée avec succès',
      key: raw,
      key_prefix: prefix,
      name: name.trim(),
      permissions: perms,
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const { id, name, permissions, is_active, expires_at } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const data: any = {}
    if (name !== undefined) data.name = name
    if (permissions !== undefined) data.permissions = permissions === 'read_write' ? 'read_write' : 'read'
    if (is_active !== undefined) data.is_active = is_active
    if (expires_at !== undefined) data.expires_at = expires_at ? new Date(expires_at) : null

    const updated = await prismaLocal.apiKey.update({
      where: { id: Number(id) },
      data,
      select: {
        id: true,
        name: true,
        key_prefix: true,
        permissions: true,
        expires_at: true,
        is_active: true,
        created_at: true,
        created_by: true,
      }
    })

    return NextResponse.json(updated)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await prismaLocal.apiKey.delete({ where: { id: Number(id) } })

    return NextResponse.json({ message: 'Clé API supprimée' })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
