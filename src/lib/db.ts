import { PrismaClient } from '@prisma/client'
import { PrismaClient as PrismaLocalClient } from '../generated/local-client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaLocal: PrismaLocalClient | undefined
  _prismaInstance: PrismaClient | undefined
}

// 1. Client Local (SQLite - TOUJOURS STATIQUE)
export const prismaLocal =
  globalForPrisma.prismaLocal ??
  new PrismaLocalClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaLocal = prismaLocal
}

/**
 * Construit l'URL PostgreSQL à partir des paramètres stockés en SQLite (prismaLocal).
 */
async function getDynamicPostgresUrl(): Promise<string | null> {
  try {
    const keys = ['PG_HOST', 'PG_PORT', 'PG_USER', 'PG_PASSWORD', 'PG_DATABASE', 'PG_SCHEMA']
    const params = await prismaLocal.parametre.findMany({
      where: { cle: { in: keys } }
    })
    
    const config = Object.fromEntries(params.map(p => [p.cle, p.valeur]))
    
    if (!config.PG_HOST || !config.PG_DATABASE) {
      return process.env.POSTGRES_URL || null
    }

    const host = config.PG_HOST || process.env.POSTGRES_HOST
    const port = config.PG_PORT || process.env.POSTGRES_PORT || '5432'
    const user = config.PG_USER || process.env.POSTGRES_USER || 'postgres'
    const pass = config.PG_PASSWORD || process.env.POSTGRES_PASSWORD || ''
    const db = config.PG_DATABASE || process.env.POSTGRES_DATABASE
    const schema = config.PG_SCHEMA || process.env.POSTGRES_SCHEMA || 'public'

    if (!host || !db) {
       // Fallback sur l'URL complète si définie
       return process.env.POSTGRES_URL || null
    }

    return `postgresql://${user}:${pass}@${host}:${port}/${db}?schema=${schema}`
  } catch (e) {
    console.error('[DB-CONFIG] Erreur lecture config local:', e)
    return process.env.POSTGRES_URL || null
  }
}

/**
 * Récupère ou initialise l'instance Prisma PostgreSQL avec la config la plus fraîche.
 */
async function getPrismaInstance(): Promise<PrismaClient> {
  if (!globalForPrisma._prismaInstance) {
    let url = await getDynamicPostgresUrl()
    
    // Ajout d'une limite de pool pour éviter de saturer les clients déjà ouverts
    if (url && !url.includes('connection_limit')) {
      url += (url.includes('?') ? '&' : '?') + 'connection_limit=10'
    }

    globalForPrisma._prismaInstance = new PrismaClient({
      ...(url ? { datasources: { db: { url } } } : {}),
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }
  return globalForPrisma._prismaInstance
}

/**
 * Force la réinitialisation du client PostgreSQL.
 */
export async function refreshPrismaInstance() {
  if (globalForPrisma._prismaInstance) {
    await globalForPrisma._prismaInstance.$disconnect().catch(() => {})
    globalForPrisma._prismaInstance = undefined
  }
}

/**
 * PROXY 'prisma' : Permet d'utiliser 'import { prisma } from ...' sans rien changer au reste du code.
 * Intercepte les accès aux modèles et injecte l'initialisation asynchrone.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop: string) {
    // Si on demande des propriétés de base du client (ex: $connect, $disconnect)
    if (prop.startsWith('$')) {
      return async (...args: any[]) => {
        const instance = await getPrismaInstance()
        return (instance as any)[prop](...args)
      }
    }

    // Capture l'accès au modèle (ex: prisma.refAgent)
    return new Proxy({}, {
      get(modelTarget, method: string) {
        return async (...args: any[]) => {
          try {
            const instance = await getPrismaInstance()
            const model = (instance as any)[prop]
            if (!model) {
              console.warn(`[PRISMA-PROXY] Modèle '${prop}' non trouvé. Vérifiez la connexion Postgres.`)
              return method === 'count' ? 0 : []
            }
            
            if (typeof model[method] !== 'function') {
               throw new Error(`Méthode '${method}' non trouvée sur le modèle '${prop}'`)
            }
            
            return await model[method](...args)
          } catch (error) {
            console.error(`[PRISMA-PROXY] Erreur sur ${prop}.${method}:`, error)
            // Retourne des valeurs par défaut pour éviter de crasher le rendu SSR
            if (method === 'count') return 0
            if (method === 'findMany') return []
            throw error // Relance pour les autres méthodes critiques
          }
        }
      }
    })
  }
})
