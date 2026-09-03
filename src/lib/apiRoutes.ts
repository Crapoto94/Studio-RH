/**
 * Registre central des routes API, utilisé par /api/routes, /api/swagger et /api/openapi.json.
 * `auth` reflète le contrôle d'accès réellement appliqué (voir src/middleware.ts):
 *  - 'public': aucune authentification requise
 *  - 'session': nécessite une session utilisateur connectée (cookie NextAuth)
 *  - 'session-admin': nécessite une session avec le rôle admin
 *  - 'api-key-or-session': accepte soit une clé API (header x-api-key), soit une session
 */
export type RouteAuth = 'public' | 'session' | 'session-admin' | 'api-key-or-session'
export type RoutePermission = 'read' | 'read_write'

export interface ApiRoute {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  description: string
  auth: RouteAuth
  permission: RoutePermission
}

export const ALL_ROUTES: ApiRoute[] = [
  { method: 'GET', path: '/api/agents', description: 'Liste des agents', auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/agents/counts', description: "Compteurs d'agents", auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/agents/positions', description: 'Positions des agents', auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/agents/extra-ad-links', description: 'Liens AD supplémentaires', auth: 'session', permission: 'read' },
  { method: 'POST', path: '/api/agents/link-ad', description: 'Lier un agent à un compte AD', auth: 'session', permission: 'read_write' },
  { method: 'GET', path: '/api/agents/import-departed', description: 'Agents importés/départs', auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/agents/{id}/brut', description: "Données brutes d'un agent", auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/agents/presence', description: "Statut de présence d'un agent (par email ou nom/prénom, recherche tolérante)", auth: 'api-key-or-session', permission: 'read' },
  { method: 'GET', path: '/api/ad/search', description: "Recherche dans l'Active Directory", auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/ad/audit', description: 'Audit AD', auth: 'session', permission: 'read' },
  { method: 'POST', path: '/api/ad/actions', description: "Actions sur l'AD", auth: 'session', permission: 'read_write' },
  { method: 'POST', path: '/api/test-ad', description: 'Test connexion AD', auth: 'session', permission: 'read_write' },
  { method: 'POST', path: '/api/test-azure', description: 'Test connexion Azure', auth: 'session', permission: 'read_write' },
  { method: 'GET', path: '/api/sql/views', description: 'Liste des vues SQL', auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/sql/tables', description: 'Liste des tables SQL', auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/sql/positions', description: 'Liste des positions SQL', auth: 'session', permission: 'read' },
  { method: 'POST', path: '/api/sql', description: 'Exécution de requête SQL', auth: 'session', permission: 'read_write' },
  { method: 'POST', path: '/api/synchro/rh', description: 'Lancer synchro RH (admin, ou Bearer CRON_SECRET)', auth: 'session-admin', permission: 'read_write' },
  { method: 'POST', path: '/api/synchro/ad', description: 'Lancer synchro AD (admin, ou Bearer CRON_SECRET)', auth: 'session-admin', permission: 'read_write' },
  { method: 'POST', path: '/api/synchro/azure', description: 'Lancer synchro Azure (admin, ou Bearer CRON_SECRET)', auth: 'session-admin', permission: 'read_write' },
  { method: 'GET', path: '/api/synchro/brut', description: 'Données brutes synchro', auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/synchro/logs', description: 'Logs de synchro', auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/synchro/logs/{id}', description: "Détail d'un log de synchro", auth: 'session', permission: 'read' },
  { method: 'POST', path: '/api/synchro/cancel', description: 'Annuler une synchro', auth: 'session', permission: 'read_write' },
  { method: 'GET', path: '/api/onboarding', description: 'Liste des onboarding (mode=futurs : futurs agents non onboardés)', auth: 'api-key-or-session', permission: 'read' },
  { method: 'POST', path: '/api/onboarding', description: 'Créer un onboarding', auth: 'api-key-or-session', permission: 'read_write' },
  { method: 'GET', path: '/api/onboarding/{id}', description: 'Détail onboarding', auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/onboarding/{id}/pdf', description: 'Générer PDF onboarding', auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/onboarding/{id}/logs', description: "Logs d'un onboarding", auth: 'session', permission: 'read' },
  { method: 'POST', path: '/api/onboarding/{id}/resend', description: 'Renvoyer notification onboarding', auth: 'session', permission: 'read_write' },
  { method: 'GET', path: '/api/onboarding/public', description: 'Données onboarding publiques (par token)', auth: 'public', permission: 'read' },
  { method: 'GET', path: '/api/onboarding/search-agents', description: 'Recherche agents pour onboarding (par token)', auth: 'public', permission: 'read' },
  { method: 'GET', path: '/api/onboarding/manager', description: 'Données onboarding manager (par token)', auth: 'public', permission: 'read' },
  { method: 'GET', path: '/api/onboarding/tasks/{id}', description: 'Détail tâche onboarding', auth: 'session', permission: 'read' },
  { method: 'PATCH', path: '/api/onboarding/tasks/{id}', description: 'Acquitter/modifier une tâche onboarding', auth: 'api-key-or-session', permission: 'read_write' },
  { method: 'POST', path: '/api/onboarding/tasks/{id}/resend', description: 'Renvoyer notification tâche', auth: 'session', permission: 'read_write' },
  { method: 'POST', path: '/api/onboarding/tasks/acknowledge', description: 'Accuser réception tâche', auth: 'session', permission: 'read_write' },
  { method: 'GET', path: '/api/hierarchy', description: 'Données hiérarchie', auth: 'session', permission: 'read' },
  { method: 'POST', path: '/api/hierarchy/reconstruct', description: 'Reconstruire hiérarchie', auth: 'session', permission: 'read_write' },
  { method: 'GET', path: '/api/alignments', description: 'Liste des alignements', auth: 'session', permission: 'read' },
  { method: 'POST', path: '/api/alignments', description: 'Créer un alignement', auth: 'session', permission: 'read_write' },
  { method: 'GET', path: '/api/alignments/check', description: 'Vérifier alignements', auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/alignments/export', description: 'Exporter alignements', auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/alignments/{id}', description: 'Détail alignement', auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/parametres', description: 'Liste des paramètres', auth: 'session-admin', permission: 'read' },
  { method: 'PUT', path: '/api/parametres', description: 'Mettre à jour un paramètre', auth: 'session-admin', permission: 'read_write' },
  { method: 'GET', path: '/api/users', description: 'Liste des utilisateurs', auth: 'session-admin', permission: 'read' },
  { method: 'POST', path: '/api/users', description: 'Créer un utilisateur', auth: 'session-admin', permission: 'read_write' },
  { method: 'PATCH', path: '/api/users', description: 'Modifier un utilisateur', auth: 'session-admin', permission: 'read_write' },
  { method: 'GET', path: '/api/roles', description: 'Liste des rôles', auth: 'session-admin', permission: 'read' },
  { method: 'GET', path: '/api/api-keys', description: 'Liste des clés API', auth: 'session-admin', permission: 'read' },
  { method: 'POST', path: '/api/api-keys', description: 'Créer une clé API', auth: 'session-admin', permission: 'read_write' },
  { method: 'PUT', path: '/api/api-keys', description: 'Modifier une clé API', auth: 'session-admin', permission: 'read_write' },
  { method: 'DELETE', path: '/api/api-keys', description: 'Supprimer une clé API', auth: 'session-admin', permission: 'read_write' },
  { method: 'GET', path: '/api/logs/emails', description: 'Logs des emails', auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/logs/sms', description: 'Logs des SMS', auth: 'session', permission: 'read' },
  { method: 'POST', path: '/api/test-mail', description: "Test d'envoi d'email", auth: 'session', permission: 'read_write' },
  { method: 'POST', path: '/api/test-astre', description: 'Test API Astre', auth: 'session', permission: 'read_write' },
  { method: 'GET', path: '/api/crons', description: 'Liste des tâches planifiées', auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/dsihub/apps', description: 'Liste des apps DSIHub', auth: 'session', permission: 'read' },
  { method: 'POST', path: '/api/admin/migrate', description: 'Migration admin', auth: 'session-admin', permission: 'read_write' },
  { method: 'GET', path: '/api/routes', description: 'Liste des routes API (JSON)', auth: 'public', permission: 'read' },
  { method: 'GET', path: '/api/swagger', description: 'Documentation Swagger interactive', auth: 'public', permission: 'read' },
]
