import { Pool } from 'pg';
import { prismaLocal } from './db';

// Cache le pool pour éviter les reconnexions inutiles
let pool: Pool | null = null;

export async function getPostgresConnection() {
  if (pool) {
    return pool;
  }

  // Récupérer les paramètres de connexion depuis SQLite (on utilise prismaLocal ici)
  const params = await prismaLocal.parametre.findMany({
    where: {
      cle: {
        in: ['PG_HOST', 'PG_PORT', 'PG_DATABASE', 'PG_USER', 'PG_PASSWORD', 'PG_SCHEMA']
      }
    }
  });

  const config = Object.fromEntries(params.map(p => [p.cle, p.valeur]));

  // Vérifier qu'on a le minimum pour se connecter
  if (!config['PG_HOST'] || !config['PG_USER'] || !config['PG_DATABASE'] || !config['PG_PASSWORD']) {
    throw new Error("Paramètres Postgres incomplets dans la base de données. Assurez-vous que PG_HOST, PG_USER, PG_PASSWORD, et PG_DATABASE sont renseignés.");
  }

  pool = new Pool({
    host: config['PG_HOST'],
    port: config['PG_PORT'] ? parseInt(config['PG_PORT'], 10) : 5432,
    database: config['PG_DATABASE'],
    user: config['PG_USER'],
    password: config['PG_PASSWORD'],
    // Optionnel: on peut spécifier le schema par défaut lors de la connexion
    options: config['PG_SCHEMA'] ? `-c search_path=${config['PG_SCHEMA']}` : undefined,
  });

  return pool;
}

/**
 * Force la fermeture et la réinitialisation du pool de connexion.
 */
export async function refreshPostgresPool() {
  if (pool) {
    await pool.end().catch(() => {});
    pool = null;
  }
}

/**
 * Fonction d'aide pour exécuter une requête brute facilement.
 */
export async function queryPostgres(text: string, params?: any[]) {
  const connection = await getPostgresConnection();
  const result = await connection.query(text, params);
  return result.rows;
}
