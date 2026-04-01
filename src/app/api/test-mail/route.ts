import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmailWithTemplate } from '@/lib/api-ville'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { to, subject, body } = await req.json()

    if (!to) {
      return NextResponse.json({ error: 'Destinataire manquant' }, { status: 400 })
    }

    const success = await sendEmailWithTemplate({
      to,
      subject: subject || 'Test RH Studio',
      body: body || 'Ceci est un message de test envoyé depuis RH Studio.'
    })

    if (success) {
      return NextResponse.json({ ok: true })
    } else {
      return NextResponse.json({ error: 'Erreur lors de l\'envoi' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('API Test Mail Error:', error)
    return NextResponse.json({ error: 'Internal error', details: error.message }, { status: 500 })
  }
}
