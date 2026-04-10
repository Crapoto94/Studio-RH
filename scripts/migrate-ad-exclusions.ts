import { PrismaClient } from '@prisma/client'
import { prismaLocal } from '../src/lib/db'

const prismaPg = new PrismaClient()

async function main() {
    console.log("Migration des exclusions AD (SQLite -> Postgres)...")
    try {
        // Query SQLite directly for existing data (table is AD_EXCLUSIONS)
        const exclusionsFromSqlite: any[] = await prismaLocal.$queryRawUnsafe(`SELECT * FROM AD_EXCLUSIONS`)
        console.log(`Trouvé ${exclusionsFromSqlite.length} exclusions dans SQLite.`)

        for (const ex of exclusionsFromSqlite) {
            // Ne pas migrer SSDCC si on en a besoin pour Cathia CADINOT !
            if (ex.sam_account === 'SSDCC') {
                console.log(`⚠️  Compte 'SSDCC' détecté dans les exclusions ! Il ne sera PAS migré afin de permettre la liaison.`)
                continue
            }

            await prismaPg.adExclusion.upsert({
                where: { sam_account: ex.sam_account },
                update: { reason: ex.reason },
                create: { 
                    sam_account: ex.sam_account, 
                    reason: ex.reason,
                    created_at: ex.created_at ? new Date(ex.created_at) : new Date()
                }
            })
        }
        console.log("Migration terminée avec succès.")

    } catch (e: any) {
        // Si la table n'existe pas ou erreur, c'est pas grave
        console.log("Erreur ou table absente dans SQLite :", e.message)
    } finally {
        await prismaLocal.$disconnect()
        await prismaPg.$disconnect()
    }
}

main()
