import { Client } from 'ldapts';
import { prismaLocal } from './db';

/**
 * Authentifie un utilisateur directement contre l'Active Directory local
 * en utilisant les paramètres stockés dans la table Parametre.
 */
export async function authenticateADDirect(login: string, password: string): Promise<boolean> {
  // Sécurité : pas de mot de passe vide
  if (!password || password.trim() === '') return false;

  try {
    // 1. Récupération des paramètres AD
    const params = await prismaLocal.parametre.findMany({
      where: { cle: { startsWith: 'AD_' } }
    });
    const config = Object.fromEntries(params.map(p => [p.cle, p.valeur]));

    const url = config['AD_SERVER_URL'] || 'ivry.local';
    const port = config['AD_PORT'] || '389';
    
    // Construction de l'identifiant pour le bind (UPN)
    // On ajoute le domaine si absent. Exemple: 'machevalier' -> 'machevalier@ivry.local'
    const userPrincipalName = login.includes('@') ? login : `${login}@ivry.local`;

    console.log(`[AD-DIRECT] Tentative de connexion LDAP : ldap://${url}:${port} pour ${userPrincipalName}`);

    const client = new Client({
      url: `ldap://${url}:${port}`,
      timeout: 5000,
      connectTimeout: 3000,
    });

    try {
      // Le bind LDAP effectue l'authentification
      await client.bind(userPrincipalName, password);
      console.log(`[AD-DIRECT] Authentification SUCCESS pour ${userPrincipalName}`);
      return true;
    } catch (bindError: any) {
      console.warn(`[AD-DIRECT] Authentification FAILURE pour ${userPrincipalName} :`, bindError.message);
      // Erreurs communes : 'Invalid Credentials', 'Server Down', etc.
      return false;
    } finally {
      await client.unbind().catch(() => {});
    }
  } catch (err: any) {
    console.error('[AD-DIRECT-CRITICAL-ERROR]', err.message);
    return false;
  }
}
