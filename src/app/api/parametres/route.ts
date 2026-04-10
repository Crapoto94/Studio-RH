import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const params = await prisma.parametre.findMany()
    return NextResponse.json(params)
  } catch (error) {
    console.error('API Parametres GET Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await req.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const updated = await prisma.parametre.upsert({
      where: { cle: key },
      update: { valeur: String(value) },
      create: { cle: key, valeur: String(value) }
    })

    // Si on change les positions actives, on recalcule le flag 'actif' pour TOUS les agents
    if (key === 'RH_POSITIONS_ACTIVES') {
      const activePositions = String(value).split(',').filter(Boolean)
      
      // On désactive tout le monde par défaut (ou selon les positions)
      await prisma.refAgent.updateMany({
        data: { actif: false }
      })

      if (activePositions.length > 0) {
        await prisma.refAgent.updateMany({
          where: { position_l: { in: activePositions } },
          data: { actif: true }
        })
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('API Parametres PUT Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
