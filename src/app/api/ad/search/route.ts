import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const term = `%${q}%`
    
    const accounts = await prisma.brutAd.findMany({
      where: {
        OR: [
          { display_name: { contains: q } },
          { sam_account: { contains: q } },
          { mail: { contains: q } }
        ]
      },
      select: {
        sam_account: true,
        display_name: true,
        mail: true
      },
      take: 10
    })

    return NextResponse.json(accounts)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
