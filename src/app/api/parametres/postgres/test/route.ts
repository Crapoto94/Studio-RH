import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPostgresConnection, queryPostgres } from '@/lib/pgClient'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { action } = await req.json()

    if (action === 'connect') {
      const result = await queryPostgres('SELECT NOW() as db_time, current_database() as db_name, current_user as db_user');
      return NextResponse.json({ ok: true, message: 'Connexion réussie', details: result[0] })
    }

    if (action === 'tables') {
      // Récupérer le schéma configuré
      const schemaParam = await prisma.parametre.findUnique({ where: { cle: 'PG_SCHEMA' } });
      const schemaName = schemaParam?.valeur || 'public';

      // Lister les tables du schéma configuré
      const query = `
        SELECT tablename 
        FROM pg_catalog.pg_tables 
        WHERE schemaname = $1
        ORDER BY tablename ASC
      `;
      const result = await queryPostgres(query, [schemaName]);
      const tables = result.map((r: any) => r.tablename);
      return NextResponse.json({ ok: true, message: `${tables.length} tables trouvées dans le schéma "${schemaName}"`, tables })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  } catch (error: any) {
    console.error('Erreur test Postgres:', error)
    return NextResponse.json({ ok: false, message: error.message || 'Erreur inconnue' }, { status: 500 })
  }
}
