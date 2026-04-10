import { NextRequest, NextResponse } from 'next/server'
import { prismaLocal } from '@/lib/db'

export async function GET() {
  try {
    const alignments = await prismaLocal.alignment.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(alignments)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, field_rh, field_ad, is_case_sensitive } = body
    
    if (!name || !field_rh || !field_ad) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    const alignment = await prismaLocal.alignment.create({
      data: { name, field_rh, field_ad, is_case_sensitive: !!is_case_sensitive }
    })
    return NextResponse.json(alignment)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
