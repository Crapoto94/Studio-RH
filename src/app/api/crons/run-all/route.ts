import { NextResponse } from 'next/server'
import { runRhSync, runAdSync, runAzureSync, runBrutSync } from '@/lib/sync'

export async function POST() {
  try {
    const results: { type: string; success: boolean; message: string }[] = []

    const syncs = [
      { type: 'rh', fn: runRhSync },
      { type: 'ad', fn: runAdSync },
      { type: 'azure', fn: runAzureSync },
      { type: 'brut', fn: runBrutSync },
    ]

    for (const sync of syncs) {
      try {
        const result = await sync.fn()
        results.push({ type: sync.type, success: result.success, message: result.message })
      } catch (e: any) {
        results.push({ type: sync.type, success: false, message: e.message })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('[RUN-ALL] Error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
