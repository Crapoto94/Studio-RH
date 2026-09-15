import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const levels = await prisma.hierarchyLevel.findMany({ orderBy: { level: 'desc' } })
    const items = await prisma.refHierarchie.findMany({ orderBy: { nom_direction_l: 'asc' } })
    const acronymes = await prisma.hierarchieAcronyme.findMany({ orderBy: { code: 'asc' } })

    return NextResponse.json({ levels, items, acronymes })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, id, data } = body

    if (type === 'level') {
      const updated = await prisma.hierarchyLevel.update({
        where: { id },
        data: {
          name: data.name,
          color: data.color,
          responsable_sql: data.responsable_sql
        }
      })
      return NextResponse.json(updated)
    }

    if (type === 'item') {
      const updated = await prisma.refHierarchie.update({
        where: { id },
        data: {
          couleur: data.couleur,
          icone: data.icone,
          responsable_sql: data.responsable_sql
        }
      })
      return NextResponse.json(updated)
    }

    if (type === 'acronyme') {
      // Upsert par (entityType, code) : permet d'éditer un acronyme même s'il n'a pas
      // encore été créé par une reconstruction (ex: entrée ajoutée entre-temps).
      const updated = await prisma.hierarchieAcronyme.upsert({
        where: { type_code: { type: data.entityType, code: data.code } },
        update: { acronyme: data.acronyme, modifie: true },
        create: { type: data.entityType, code: data.code, nom: data.nom || null, acronyme: data.acronyme, modifie: true }
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
