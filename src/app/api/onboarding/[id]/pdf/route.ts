import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateOnboardingPDF } from '@/lib/pdf'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
        return new NextResponse('Token de sécurité manquant', { status: 401 })
    }

    // Sécurité : Vérifier que le token correspond soit au manager soit à l'agent
    const onboarding = await (prisma.onboarding as any).findUnique({
      where: { id },
      select: { token_formulaire: true, token_dashboard: true, nom_temp: true, prenom_temp: true }
    })

    if (!onboarding || (token !== onboarding.token_formulaire && token !== onboarding.token_dashboard)) {
      return new NextResponse('Accès non autorisé ou dossier introuvable', { status: 403 })
    }

    const pdfBase64 = await generateOnboardingPDF(id)
    const pdfBuffer = Buffer.from(pdfBase64, 'base64')

    const filename = `Recapitulatif_Onboarding_${onboarding.nom_temp}_${onboarding.prenom_temp}.pdf`.replace(/\s+/g, '_')

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('[API-PDF-ERROR]', error)
    return new NextResponse(`Erreur lors de la génération du PDF: ${error.message}`, { status: 500 })
  }
}
