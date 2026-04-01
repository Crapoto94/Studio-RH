import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { agents } = body // Combined list of agent diffs to align

    if (!agents || !Array.isArray(agents) || agents.length === 0) {
      return NextResponse.json({ error: 'Aucun agent sélectionné' }, { status: 400 })
    }

    let script = `# Script d'alignement AD - RH Studio\n`
    script += `# Généré le ${new Date().toLocaleString('fr-FR')}\n\n`
    script += `Import-Module ActiveDirectory\n\n`

    for (const agent of agents) {
      const { ad_id, diffs } = agent
      if (!ad_id || !diffs || diffs.length === 0) continue

      const replaceMap = diffs.map((d: any) => `'${d.fieldAd}' = '${d.valRh.replace(/'/g, "''")}'`).join('; ')
      script += `Write-Host "Mise à jour de l'utilisateur : ${ad_id}"\n`
      script += `Set-ADUser -Identity "${ad_id}" -Replace @{ ${replaceMap} }\n`
      script += `if ($?) { Write-Host "Succès" -ForegroundColor Green } else { Write-Host "Échec" -ForegroundColor Red }\n\n`
    }

    return new NextResponse(script, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="alignement_ad.ps1"'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
