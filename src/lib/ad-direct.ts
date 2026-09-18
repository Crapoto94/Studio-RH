import { Client } from 'ldapts';
import { prismaLocal } from './db';

export interface AdConnectionConfig {
  rawUrl: string
  port: number
  bindDn: string
  password: string
  baseDn: string
}

/** Lit les paramètres de connexion AD depuis la table Parametre (SQLite local). */
export async function getAdConnectionConfig(): Promise<AdConnectionConfig> {
  const params = await prismaLocal.parametre.findMany()
  const config = Object.fromEntries(params.map(p => [p.cle, p.valeur]))
  return {
    rawUrl: config['AD_SERVER_URL'] || config['AD_SERVER'] || '',
    port: parseInt(config['AD_PORT'] || '389', 10),
    bindDn: config['AD_SRV_ACCOUNT'] || config['AD_USER'] || '',
    password: config['AD_SRV_PASSWORD'] || config['AD_PASSWORD'] || '',
    baseDn: config['AD_BASE_DN'] || '',
  }
}

/** Ouvre une connexion LDAP bindée avec le compte de service configuré. */
export async function connectAd(): Promise<{ client: Client; baseDn: string }> {
  const { rawUrl, port, bindDn, password, baseDn } = await getAdConnectionConfig()
  if (!rawUrl || !bindDn || !password) {
    throw new Error("Configuration AD incomplète. Vérifiez l'URL, l'identifiant et le mot de passe dans les paramètres.")
  }
  const ldapUrl = rawUrl.startsWith('ldap') ? rawUrl : `ldap://${rawUrl}`
  const client = new Client({
    url: `${ldapUrl.replace(/:\d+$/, '')}:${port}`,
    timeout: 10000,
    connectTimeout: 5000,
  })
  await client.bind(bindDn, password)
  return { client, baseDn }
}

/** Échappe les caractères spéciaux d'un filtre LDAP (RFC 4515). */
export function escapeLdapFilter(value: string): string {
  return value.replace(/[\\()*\0]/g, m => `\\${m.charCodeAt(0).toString(16).padStart(2, '0')}`)
}

/** Extrait le RDN (première composante) d'un DN, en respectant les virgules échappées. */
export function getRdn(dn: string): string {
  let result = ''
  let escaped = false
  for (const char of dn) {
    if (escaped) { result += char; escaped = false; continue }
    if (char === '\\') { result += char; escaped = true; continue }
    if (char === ',') break
    result += char
  }
  return result
}

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
