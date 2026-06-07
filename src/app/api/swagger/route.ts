import { NextResponse } from 'next/server'

const ALL_ROUTES = [
  { method: 'GET', path: '/api/agents', description: 'Liste des agents', auth: 'api-key / session', permission: 'read' },
  { method: 'GET', path: '/api/agents/counts', description: 'Compteurs d\'agents', auth: 'api-key / session', permission: 'read' },
  { method: 'GET', path: '/api/agents/positions', description: 'Positions des agents', auth: 'api-key / session', permission: 'read' },
  { method: 'GET', path: '/api/agents/extra-ad-links', description: 'Liens AD supplémentaires', auth: 'api-key / session', permission: 'read' },
  { method: 'POST', path: '/api/agents/link-ad', description: 'Lier un agent à un compte AD', auth: 'api-key / session', permission: 'read_write' },
  { method: 'GET', path: '/api/agents/import-departed', description: 'Agents importés/départs', auth: 'api-key / session', permission: 'read' },
  { method: 'GET', path: '/api/agents/[id]/brut', description: 'Données brutes d\'un agent', auth: 'api-key / session', permission: 'read' },
  { method: 'GET', path: '/api/ad/search', description: 'Recherche dans l\'Active Directory', auth: 'api-key / session', permission: 'read' },
  { method: 'GET', path: '/api/ad/audit', description: 'Audit AD', auth: 'api-key / session', permission: 'read' },
  { method: 'POST', path: '/api/ad/actions', description: 'Actions sur l\'AD', auth: 'api-key / session', permission: 'read_write' },
  { method: 'POST', path: '/api/test-ad', description: 'Test connexion AD', auth: 'api-key / session', permission: 'read_write' },
  { method: 'POST', path: '/api/test-azure', description: 'Test connexion Azure', auth: 'api-key / session', permission: 'read_write' },
  { method: 'GET', path: '/api/sql/views', description: 'Liste des vues SQL', auth: 'api-key / session', permission: 'read' },
  { method: 'GET', path: '/api/sql/tables', description: 'Liste des tables SQL', auth: 'api-key / session', permission: 'read' },
  { method: 'GET', path: '/api/sql/positions', description: 'Liste des positions SQL', auth: 'api-key / session', permission: 'read' },
  { method: 'POST', path: '/api/sql', description: 'Exécution de requête SQL', auth: 'api-key / session', permission: 'read_write' },
  { method: 'POST', path: '/api/synchro/rh', description: 'Lancer synchro RH', auth: 'api-key / session', permission: 'read_write' },
  { method: 'POST', path: '/api/synchro/ad', description: 'Lancer synchro AD', auth: 'api-key / session', permission: 'read_write' },
  { method: 'POST', path: '/api/synchro/azure', description: 'Lancer synchro Azure', auth: 'api-key / session', permission: 'read_write' },
  { method: 'GET', path: '/api/synchro/brut', description: 'Données brutes synchro', auth: 'api-key / session', permission: 'read' },
  { method: 'GET', path: '/api/synchro/logs', description: 'Logs de synchro', auth: 'api-key / session', permission: 'read' },
  { method: 'GET', path: '/api/synchro/logs/[id]', description: 'Détail d\'un log de synchro', auth: 'api-key / session', permission: 'read' },
  { method: 'POST', path: '/api/synchro/cancel', description: 'Annuler une synchro', auth: 'api-key / session', permission: 'read_write' },
  { method: 'GET', path: '/api/onboarding', description: 'Liste des onboarding', auth: 'api-key / session', permission: 'read' },
  { method: 'POST', path: '/api/onboarding', description: 'Créer un onboarding', auth: 'api-key / session', permission: 'read_write' },
  { method: 'GET', path: '/api/onboarding/[id]', description: 'Détail onboarding', auth: 'api-key / session', permission: 'read' },
  { method: 'GET', path: '/api/onboarding/[id]/pdf', description: 'Générer PDF onboarding', auth: 'api-key / session', permission: 'read' },
  { method: 'GET', path: '/api/onboarding/[id]/logs', description: 'Logs d\'un onboarding', auth: 'api-key / session', permission: 'read' },
  { method: 'POST', path: '/api/onboarding/[id]/resend', description: 'Renvoyer notification onboarding', auth: 'api-key / session', permission: 'read_write' },
  { method: 'GET', path: '/api/onboarding/tasks/[id]', description: 'Détail tâche onboarding', auth: 'api-key / session', permission: 'read' },
  { method: 'POST', path: '/api/onboarding/tasks/[id]/resend', description: 'Renvoyer notification tâche', auth: 'api-key / session', permission: 'read_write' },
  { method: 'POST', path: '/api/onboarding/tasks/acknowledge', description: 'Accuser réception tâche', auth: 'api-key / session', permission: 'read_write' },
  { method: 'GET', path: '/api/hierarchy', description: 'Données hiérarchie', auth: 'api-key / session', permission: 'read' },
  { method: 'POST', path: '/api/hierarchy/reconstruct', description: 'Reconstruire hiérarchie', auth: 'api-key / session', permission: 'read_write' },
  { method: 'GET', path: '/api/alignments', description: 'Liste des alignements', auth: 'api-key / session', permission: 'read' },
  { method: 'POST', path: '/api/alignments', description: 'Créer un alignement', auth: 'api-key / session', permission: 'read_write' },
  { method: 'GET', path: '/api/alignments/check', description: 'Vérifier alignements', auth: 'api-key / session', permission: 'read' },
  { method: 'GET', path: '/api/alignments/export', description: 'Exporter alignements', auth: 'api-key / session', permission: 'read' },
  { method: 'GET', path: '/api/alignments/[id]', description: 'Détail alignement', auth: 'api-key / session', permission: 'read' },
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
  { method: 'GET', path: '/api/logs/emails', description: 'Logs des emails', auth: 'api-key / session', permission: 'read' },
  { method: 'GET', path: '/api/logs/sms', description: 'Logs des SMS', auth: 'api-key / session', permission: 'read' },
  { method: 'POST', path: '/api/test-mail', description: 'Test d\'envoi d\'email', auth: 'api-key / session', permission: 'read_write' },
  { method: 'POST', path: '/api/test-astre', description: 'Test API Astre', auth: 'api-key / session', permission: 'read_write' },
  { method: 'GET', path: '/api/crons', description: 'Liste des tâches planifiées', auth: 'session', permission: 'read' },
  { method: 'GET', path: '/api/dsihub/apps', description: 'Liste des apps DSIHub', auth: 'session', permission: 'read' },
  { method: 'POST', path: '/api/admin/migrate', description: 'Migration admin', auth: 'session-admin', permission: 'read_write' },
  { method: 'GET', path: '/api/routes', description: 'Liste des routes API', auth: 'public', permission: 'read' },
  { method: 'GET', path: '/api/swagger', description: 'Documentation Swagger', auth: 'public', permission: 'read' },
]

const groups: Record<string, typeof ALL_ROUTES> = {}
for (const route of ALL_ROUTES) {
  const prefix = route.path.split('/').slice(0, 3).join('/')
  if (!groups[prefix]) groups[prefix] = []
  groups[prefix].push(route)
}

const methodColors: Record<string, string> = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  PATCH: '#8b5cf6',
  DELETE: '#ef4444',
}

function html() {
  let groupHtml = ''
  for (const [prefix, routes] of Object.entries(groups)) {
    groupHtml += `
      <div class="group">
        <div class="group-title">${prefix}</div>
        <table>
          <thead>
            <tr><th class="method-col">Méthode</th><th class="path-col">Chemin</th><th class="desc-col">Description</th><th class="auth-col">Permission</th></tr>
          </thead>
          <tbody>
            ${routes.map(r => `
              <tr>
                <td><span class="method method-${r.method.toLowerCase()}">${r.method}</span></td>
                <td><code>${r.path}</code></td>
                <td class="desc">${r.description}</td>
                <td><span class="auth-badge ${r.permission === 'read_write' ? 'badge-amber' : 'badge-blue'}">${r.permission === 'read_write' ? 'Écriture' : 'Lecture'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RH Studio - Documentation API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f4f6fb;
      color: #1a2340;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    header {
      background: linear-gradient(135deg, #1a2340, #2d3a6e);
      color: white;
      padding: 2rem;
      border-radius: 16px;
      margin-bottom: 2rem;
    }
    header h1 { font-size: 1.5rem; font-weight: 700; }
    header p { color: #a5b4e0; margin-top: 0.5rem; font-size: 0.875rem; }
    header .badge {
      display: inline-block;
      background: rgba(255,255,255,0.15);
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      margin-top: 0.75rem;
    }
    .info-box {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .info-box h3 { font-size: 0.875rem; color: #475569; margin-bottom: 0.75rem; }
    .info-box code {
      display: block;
      background: #f1f5f9;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.8125rem;
      color: #4f46e5;
      margin-bottom: 0.5rem;
    }
    .stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem 1.5rem;
      flex: 1;
    }
    .stat-card .num { font-size: 1.5rem; font-weight: 700; color: #1a2340; }
    .stat-card .label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.25rem; }
    .group {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      margin-bottom: 1rem;
      overflow: hidden;
    }
    .group-title {
      background: #f8fafc;
      padding: 0.75rem 1.25rem;
      font-weight: 600;
      font-size: 0.8125rem;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
    }
    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left;
      padding: 0.75rem 1.25rem;
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      background: #fafafa;
      border-bottom: 1px solid #e2e8f0;
    }
    td {
      padding: 0.75rem 1.25rem;
      font-size: 0.8125rem;
      border-bottom: 1px solid #f1f5f9;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover { background: #f8fafc; }
    .method-col { width: 90px; }
    .path-col { width: 40%; }
    .desc-col { }
    .auth-col { width: 100px; }
    .method {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.6875rem;
      color: white;
      min-width: 48px;
      text-align: center;
    }
    .method-get { background: #22c55e; }
    .method-post { background: #3b82f6; }
    .method-put { background: #f59e0b; }
    .method-patch { background: #8b5cf6; }
    .method-delete { background: #ef4444; }
    td code {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.75rem;
      color: #334155;
      background: #f1f5f9;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
    }
    .desc { color: #64748b; }
    .auth-badge {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      font-size: 0.6875rem;
      font-weight: 600;
    }
    .badge-blue { background: #eff6ff; color: #3b82f6; }
    .badge-amber { background: #fffbeb; color: #d97706; }
    .footer {
      text-align: center;
      padding: 2rem;
      color: #94a3b8;
      font-size: 0.75rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📋 RH Studio — Documentation API</h1>
      <p>Liste complète des routes API disponibles. Les routes marquées "Écriture" nécessitent une clé API avec permissions read_write ou une session administrateur.</p>
      <div class="badge">${ALL_ROUTES.length} endpoints · ${Object.keys(groups).length} groupes</div>
    </header>

    <div class="info-box">
      <h3>🔑 Authentification par clé API</h3>
      <code>Header: x-api-key: votre_clé_api</code>
      <code>curl -H "x-api-key: rh_..." http://localhost:3000/api/agents</code>
      <p style="color: #64748b; font-size: 0.75rem; margin-top: 0.5rem;">
        Les clés API se gèrent dans <strong>Paramètres → Clés API</strong>. Une clé en lecture seule ne peut que lire les données (GET). Une clé en lecture/écriture peut aussi créer, modifier ou supprimer des données.
      </p>
    </div>

    <div class="stats">
      <div class="stat-card"><div class="num">${ALL_ROUTES.filter(r => r.method === 'GET').length}</div><div class="label">GET (lecture)</div></div>
      <div class="stat-card"><div class="num">${ALL_ROUTES.filter(r => r.method !== 'GET').length}</div><div class="label">POST/PUT/PATCH/DELETE (écriture)</div></div>
      <div class="stat-card"><div class="num">${ALL_ROUTES.filter(r => r.permission === 'read').length}</div><div class="label">Lecture seule</div></div>
      <div class="stat-card"><div class="num">${ALL_ROUTES.filter(r => r.permission === 'read_write').length}</div><div class="label">Lecture/Écriture</div></div>
    </div>

    ${groupHtml}

    <div class="footer">
      RH Studio — API Documentation — Généré automatiquement
    </div>
  </div>
</body>
</html>`
}

export async function GET() {
  return new NextResponse(html(), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
