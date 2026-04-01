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
    
    // Using raw SQL for case-insensitive search in SQLite and bypassing stale Prisma schema issues
    const accounts = await prisma.$queryRawUnsafe(`
      SELECT sam_account, display_name, mail 
      FROM "BRUT_AD" 
      WHERE display_name LIKE ? OR sam_account LIKE ? OR mail LIKE ? 
      LIMIT 10
    `, term, term, term)

    return NextResponse.json(accounts)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
