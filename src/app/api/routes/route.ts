import { NextResponse } from 'next/server'
import { ALL_ROUTES } from '@/lib/apiRoutes'

export async function GET() {
  return NextResponse.json(ALL_ROUTES)
}
