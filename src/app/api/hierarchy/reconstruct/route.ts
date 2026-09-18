import { NextRequest, NextResponse } from 'next/server'
import { rebuildHierarchie } from '@/lib/hierarchy'

export async function POST(req: NextRequest) {
  try {
    const result = await rebuildHierarchie()

    return NextResponse.json({
      success: true,
      message: `Reconstruction terminée : ${result.paths} chemins traités, ${result.created} nouveaux créés, ${result.deleted} obsolètes supprimés, ${result.acronymesCreated} acronymes générés.`,
      count: result.paths
    })
  } catch (error) {
    console.error('Hierarchy Reconstruction Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
