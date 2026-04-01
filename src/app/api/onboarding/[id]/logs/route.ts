import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { id: idParam } = await params
    const onboardingId = parseInt(idParam)

    const [emails, sms] = await Promise.all([
      prisma.emailLog.findMany({
        where: { onboarding_id: onboardingId },
        orderBy: { sent_at: 'desc' }
      }),
      prisma.smsLog.findMany({
        where: { onboarding_id: onboardingId },
        orderBy: { sent_at: 'desc' }
      })
    ])

    return NextResponse.json({ emails, sms })
  } catch (error) {
    console.error('API Onboarding Logs GET Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
