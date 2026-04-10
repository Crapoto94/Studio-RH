import { getPostgresConnection, queryPostgres } from '../lib/pgClient';
import { prisma } from '../lib/db';

async function main() {
  console.log("== TEST CONNEXION POSTGRES DEPUIS SQLITE ==");
  
  // 1. On insère/m-à-j les paramètres de test dans SQLite (simulant la saisie depuis l'admin)
  const defaultParams = [
    { cle: 'PG_HOST', valeur: '10.103.130.106' },
    { cle: 'PG_PORT', valeur: '5432' },
    { cle: 'PG_DATABASE', valeur: 'ivry_agents' }, // Mettre le vrai nom de la base externe
    { cle: 'PG_USER', valeur: 'dsi' },
    { cle: 'PG_PASSWORD', valeur: 'ivry2026' }, // Mettre le vrai mot de passe
    { cle: 'PG_SCHEMA', valeur: 'public' },
  ];

  console.log("1. Pré-remplissage des paramètres dans SQLite...");
  for (const p of defaultParams) {
    const exists = await prisma.parametre.findUnique({ where: { cle: p.cle } });
    if (!exists) {
      await prisma.parametre.create({ data: { cle: p.cle, valeur: p.valeur, description: 'Connexion PostgreSQL', type: 'system' }});
    }
  }

  // 2. On tente la connexion
  console.log("2. Tentative de connexion via pg...");
  try {
    const pool = await getPostgresConnection();
    const result = await pool.query('SELECT NOW() as date, current_database() as db');
    console.log("✅ Connexion réussie à Postgres !");
    console.log(result.rows[0]);
  } catch (err: any) {
    console.error("❌ Erreur de connexion Postgres :", err.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main().catch(console.error);
