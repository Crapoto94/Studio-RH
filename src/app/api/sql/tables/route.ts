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

    // SQLite query to list tables
    const tablesRaw = await prisma.$queryRawUnsafe<any[]>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    
    const tableNames = tablesRaw.map(t => t.name)

    return NextResponse.json(tableNames)
  } catch (error) {
    console.error('API SQL Tables Error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
