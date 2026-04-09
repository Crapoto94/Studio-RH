import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { randomUUID } from 'crypto'
import { notifyManager } from '@/lib/onboarding'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: idParam } = await params
    const id = parseInt(idParam)
    const onboarding = await prisma.onboarding.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { id: 'asc' }
        },
        agent: true,
        manager: true
      }
    })

    if (!onboarding) {
      return NextResponse.json({ error: 'Onboarding NOT FOUND' }, { status: 404 })
    }

    // Récupérer la config du formulaire pour que le front puisse mapper les labels
    const configParam = await prisma.parametre.findUnique({ where: { cle: 'ONBOARDING_FORM_CONFIG' } })
    
    return NextResponse.json({
      ...onboarding,
      config: configParam?.valeur || '[]'
    })
  } catch (error) {
    console.error('[Onboarding GET Error]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: idParam } = await params
    const id = parseInt(idParam)

    // Supprimer les tâches et les logs associés
    await prisma.onboardingTask.deleteMany({ where: { onboarding_id: id } })
    await prisma.emailLog.updateMany({ where: { onboarding_id: id }, data: { onboarding_id: null } })
    await prisma.smsLog.updateMany({ where: { onboarding_id: id }, data: { onboarding_id: null } })
    
    await prisma.onboarding.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Onboarding Delete Error]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: idParam } = await params
    const id = parseInt(idParam)
    const body = await req.json()

    // 1. Récupérer l'onboarding pour avoir le token
    const currentOnb = await (prisma.onboarding as any).findUnique({ where: { id }, include: { agent: true }})
    if (!currentOnb) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let token = currentOnb.token_formulaire
    if (body.action === 'launch' && !token) {
        token = randomUUID()
    }

    const dataToUpdate: any = {
        manager_id: body.manager_id !== undefined ? body.manager_id : currentOnb.manager_id,
        nom_temp: body.nom_temp !== undefined ? body.nom_temp : currentOnb.nom_temp,
        prenom_temp: body.prenom_temp !== undefined ? body.prenom_temp : currentOnb.prenom_temp,
        direction_temp: body.direction_temp !== undefined ? body.direction_temp : currentOnb.direction_temp,
        service_temp: body.service_temp !== undefined ? body.service_temp : currentOnb.service_temp,
        poste_temp: body.poste_temp !== undefined ? body.poste_temp : currentOnb.poste_temp,
        date_arrivee_prevue: body.date_arrivee_prevue ? new Date(body.date_arrivee_prevue) : currentOnb.date_arrivee_prevue,
        updated_at: new Date()
    }

    if (body.action === 'launch') {
        dataToUpdate.statut = 'en_cours_demande'
        dataToUpdate.token_formulaire = token
    } else if (body.action === 'cancel') {
        dataToUpdate.statut = 'annule'
    }

    const updated = await prisma.onboarding.update({
      where: { id },
      data: dataToUpdate
    })

    // 2. Si Lancement demandé, on envoi le mail via la fonction centralisée
    if (body.action === 'launch' && dataToUpdate.manager_id) {
        // notifyManager gère les templates et l'URL de base dynamique
        await notifyManager(updated, dataToUpdate.manager_id, req.nextUrl.origin)
          .catch(err => console.error('[ONBOARDING-PATCH-MAIL-ERROR]', err))
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[Onboarding Update Error]', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
