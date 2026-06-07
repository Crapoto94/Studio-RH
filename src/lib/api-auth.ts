import { NextRequest } from 'next/server'
import { prismaLocal } from '@/lib/db'
import * as crypto from 'crypto'

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = 'rh_' + crypto.randomBytes(24).toString('hex')
  const hash = hashApiKey(raw)
  const prefix = raw.substring(0, 10) + '...'
  return { raw, hash, prefix }
}

export type ApiAuthResult =
  | { authorized: true; permission: 'read' | 'read_write' }
  | { authorized: false; error: string }

export async function authenticateApiRequest(
  req: NextRequest,
  requiredPermission: 'read' | 'read_write' = 'read'
): Promise<ApiAuthResult> {
  const apiKey = req.headers.get('x-api-key')
  if (!apiKey) {
    return { authorized: false, error: 'Clé API manquante. Envoyez x-api-key dans les headers.' }
  }

  const hash = hashApiKey(apiKey)
  const keyRecord = await prismaLocal.apiKey.findUnique({ where: { key_hash: hash } })

  if (!keyRecord) {
    return { authorized: false, error: 'Clé API invalide.' }
  }

  if (!keyRecord.is_active) {
    return { authorized: false, error: 'Clé API désactivée.' }
  }

  if (keyRecord.expires_at && new Date() > keyRecord.expires_at) {
    return { authorized: false, error: 'Clé API expirée.' }
  }

  if (requiredPermission === 'read_write' && keyRecord.permissions !== 'read_write') {
    return { authorized: false, error: 'Permission insuffisante. Cette route nécessite un accès en écriture.' }
  }

  return { authorized: true, permission: keyRecord.permissions as 'read' | 'read_write' }
}
