/**
 * Script de réparation des séquences PostgreSQL
 * Usage: npx tsx src/scripts/fix-sequences.ts
 * 
 * Corrige : 
 *  - Les lignes avec id IS NULL dans toutes les tables
 *  - Les séquences autoincrement cassées (SERIAL)
 */

import { prisma, prismaLocal } from '../lib/db'

// Tables Prisma et leurs vraies tables PostgreSQL
const TABLES = [
  { model: 'REF_AGENTS',       seq: 'REF_AGENTS_id_seq'       },
  { model: 'ONBOARDING',       seq: 'ONBOARDING_id_seq'       },
  { model: 'ONBOARDING_TASKS', seq: 'ONBOARDING_TASKS_id_seq' },
  { model: 'SYNCHRO_LOGS',     seq: 'SYNCHRO_LOGS_id_seq'     },
  { model: 'SYNC_AGENT_LOGS',  seq: 'SYNC_AGENT_LOGS_id_seq'  },
  { model: 'AUDITS',           seq: 'AUDITS_id_seq'            },
  { model: 'EMAIL_LOGS',       seq: 'EMAIL_LOGS_id_seq'        },
  { model: 'SMS_LOGS',         seq: 'SMS_LOGS_id_seq'          },
  { model: 'BRUT_RH',          seq: 'BRUT_RH_id_seq'          },
  { model: 'BRUT_AD',          seq: 'BRUT_AD_id_seq'           },
  { model: 'BRUT_AZURE',       seq: 'BRUT_AZURE_id_seq'        },
  { model: 'BRUT_HIERARCHIE',  seq: 'BRUT_HIERARCHIE_id_seq'  },
  { model: 'REF_HIERARCHIE',   seq: 'REF_HIERARCHIE_id_seq'   },
  { model: 'EXTRA_AD_LINKS',   seq: 'EXTRA_AD_LINKS_id_seq'   },
]

async function main() {
  console.log('=== RÉPARATION DES SÉQUENCES POSTGRESQL ===\n')

  // Récupérer le schéma configuré
  const schemaParam = await prismaLocal.parametre.findFirst({ where: { cle: 'PG_SCHEMA' } })
  const schema = schemaParam?.valeur || 'public'
  console.log(`Schéma cible: ${schema}\n`)

  for (const { model, seq } of TABLES) {
    try {
      // 1. Compter lignes avec id IS NULL
      const nullResult: any[] = await (prisma as any).$queryRawUnsafe(
        `SELECT COUNT(*) as cnt FROM "${schema}"."${model}" WHERE id IS NULL`
      )
      const nullCount = parseInt(nullResult[0]?.cnt || '0')

      if (nullCount > 0) {
        console.log(`⚠️  ${model}: ${nullCount} ligne(s) avec id NULL — suppression...`)
        await (prisma as any).$queryRawUnsafe(
          `DELETE FROM "${schema}"."${model}" WHERE id IS NULL`
        )
        console.log(`   ✅ Supprimées`)
      }

      // 2. Récupérer le MAX(id) actuel
      const maxResult: any[] = await (prisma as any).$queryRawUnsafe(
        `SELECT COALESCE(MAX(id), 0) as max_id FROM "${schema}"."${model}"`
      )
      const maxId = parseInt(maxResult[0]?.max_id || '0')

      // 3. Vérifier si la séquence existe
      const seqResult: any[] = await (prisma as any).$queryRawUnsafe(`
        SELECT sequence_name FROM information_schema.sequences 
        WHERE sequence_schema = $1 AND sequence_name = $2
      `, schema, seq)

      if (seqResult.length === 0) {
        // Créer la séquence
        console.log(`🔧 ${model}: Séquence "${seq}" manquante — création (départ: ${maxId + 1})`)
        await (prisma as any).$queryRawUnsafe(
          `CREATE SEQUENCE IF NOT EXISTS "${schema}"."${seq}" START WITH ${maxId + 1} INCREMENT BY 1`
        )
        await (prisma as any).$queryRawUnsafe(
          `ALTER TABLE "${schema}"."${model}" ALTER COLUMN id SET DEFAULT nextval('"${schema}"."${seq}"')`
        )
        console.log(`   ✅ Séquence créée et liée`)
      } else {
        // Recaler la séquence au bon MAX+1
        const newStart = maxId + 1
        await (prisma as any).$queryRawUnsafe(
          `SELECT setval('"${schema}"."${seq}"', ${newStart}, false)`
        )
        console.log(`✅ ${model}: Séquence recalée à ${newStart} (max id = ${maxId})`)
      }
    } catch (e: any) {
      console.log(`⏭️  ${model}: ${e.message.split('\n')[0]}`)
    }
  }

  console.log('\n=== VÉRIFICATION FINALE ===')
  try {
    // Test rapide : peut-on créer un audit ?
    const test: any[] = await (prisma as any).$queryRawUnsafe(
      `INSERT INTO "${schema}"."AUDITS" (action, created_at) VALUES ('seq_repair_test', NOW()) RETURNING id`
    )
    const testId = test[0]?.id
    console.log(`✅ Test INSERT AUDITS OK → id généré: ${testId}`)
    // Nettoyer le test
    await (prisma as any).$queryRawUnsafe(
      `DELETE FROM "${schema}"."AUDITS" WHERE id = ${testId}`
    )
  } catch (e: any) {
    console.error(`❌ Test INSERT échoué: ${e.message}`)
  }

  console.log('\n=== RÉPARATION TERMINÉE ===')
}

main()
  .catch(e => { console.error('FATAL:', e.message); process.exit(1) })
  .finally(async () => {
    await (prisma as any).$disconnect().catch(() => {})
    await prismaLocal.$disconnect().catch(() => {})
  })
