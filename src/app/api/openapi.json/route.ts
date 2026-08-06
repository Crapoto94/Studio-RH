import { NextRequest, NextResponse } from 'next/server'
import { ALL_ROUTES, type ApiRoute } from '@/lib/apiRoutes'

function tagFor(path: string): string {
  const parts = path.split('/').filter(Boolean) // ['api', 'agents', ...]
  return parts[1] || 'api'
}

function pathParams(path: string): { name: string; in: 'path'; required: true; schema: { type: 'string' } }[] {
  const matches = path.match(/\{([^}]+)\}/g) || []
  return matches.map(m => ({
    name: m.slice(1, -1),
    in: 'path' as const,
    required: true as const,
    schema: { type: 'string' as const },
  }))
}

function securityFor(auth: ApiRoute['auth']) {
  if (auth === 'public') return []
  return [{ ApiKeyAuth: [] }, { SessionAuth: [] }]
}

function genericOperation(route: ApiRoute) {
  return {
    summary: route.description,
    tags: [tagFor(route.path)],
    parameters: pathParams(route.path),
    security: securityFor(route.auth),
    responses: {
      '200': { description: 'Succès' },
      ...(route.auth !== 'public' ? { '401': { description: 'Non autorisé' } } : {}),
      ...(route.permission === 'read_write' ? { '403': { description: 'Permission insuffisante' } } : {}),
    },
  }
}

function buildPaths() {
  const paths: Record<string, any> = {}

  for (const route of ALL_ROUTES) {
    if (!paths[route.path]) paths[route.path] = {}
    paths[route.path][route.method.toLowerCase()] = genericOperation(route)
  }

  // Spécification détaillée et testable de la route de présence.
  paths['/api/agents/presence'] = {
    get: {
      summary: "Statut de présence d'un agent",
      description:
        "Recherche un agent par email (correspondance exacte ou partielle) ou par nom/prénom " +
        "(recherche tolérante à la casse, aux accents, aux tirets, à l'ordre nom/prénom et aux " +
        "petites variantes orthographiques). Renvoie s'il est présent, parti, ou pas encore arrivé.\n\n" +
        "Fournir soit `email`, soit `q` (nom et prénom combinés, ordre indifférent), soit `nom`/`prenom` séparément.",
      tags: ['agents'],
      security: [{ ApiKeyAuth: [] }, { SessionAuth: [] }],
      parameters: [
        {
          name: 'email',
          in: 'query',
          required: false,
          description: "Email de l'agent (recherche exacte, puis partielle en repli).",
          schema: { type: 'string' },
          example: 'marie-catherine.dupont@ivry94.fr',
        },
        {
          name: 'q',
          in: 'query',
          required: false,
          description: 'Nom et prénom combinés, dans un ordre quelconque, tolérant aux fautes (ex: "DUPONT Marie", "Dupont Mary Catherine", "DUPONT-DURANT Marie Catherine").',
          schema: { type: 'string' },
          example: 'DUPONT Marie',
        },
        {
          name: 'nom',
          in: 'query',
          required: false,
          description: 'Nom de famille seul (alternative à q).',
          schema: { type: 'string' },
        },
        {
          name: 'prenom',
          in: 'query',
          required: false,
          description: 'Prénom seul (alternative à q).',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Résultat de la recherche',
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  {
                    type: 'object',
                    properties: {
                      found: { type: 'boolean', example: true },
                      matchType: { type: 'string', enum: ['exact', 'approximate'] },
                      score: { type: 'number', example: 1 },
                      agent: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          nom: { type: 'string' },
                          prenom: { type: 'string' },
                          email: { type: 'string', nullable: true },
                          matricule: { type: 'string', nullable: true },
                          service: { type: 'string', nullable: true },
                          direction: { type: 'string', nullable: true },
                          fonction: { type: 'string', nullable: true },
                          present: { type: 'boolean' },
                          status: { type: 'string', enum: ['present', 'departed', 'not_yet_arrived'] },
                          statusLabel: { type: 'string', example: 'Présent' },
                          dateArriveePrevue: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            description: "Présent uniquement si status = not_yet_arrived",
                          },
                          dateDepart: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            description: "Présent uniquement si status = departed (date_depart, ou à défaut la dernière date de présence connue)",
                          },
                        },
                      },
                    },
                  },
                  {
                    type: 'object',
                    description: 'Aucune correspondance',
                    properties: {
                      found: { type: 'boolean', example: false },
                      reason: { type: 'string', enum: ['no_match'] },
                    },
                  },
                  {
                    type: 'object',
                    description: 'Plusieurs agents correspondent, précision nécessaire',
                    properties: {
                      found: { type: 'boolean', example: false },
                      reason: { type: 'string', enum: ['ambiguous'] },
                      candidates: { type: 'array', items: { type: 'object' } },
                    },
                  },
                ],
              },
            },
          },
        },
        '400': { description: 'Paramètre manquant ou invalide' },
        '401': { description: 'Non autorisé' },
      },
    },
  }

  return paths
}

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'localhost:3000'
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')

  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'RH Studio API',
      version: '1.0.0',
      description:
        "Documentation interactive de l'API RH Studio. Authentification par clé API " +
        '(`x-api-key`) ou par session utilisateur connectée. Les clés API se gèrent dans ' +
        'Paramètres → Clés API.',
    },
    servers: [{ url: `${proto}://${host}` }],
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'x-api-key' },
        SessionAuth: { type: 'apiKey', in: 'cookie', name: 'next-auth.session-token' },
      },
    },
    paths: buildPaths(),
  }

  return NextResponse.json(spec)
}
