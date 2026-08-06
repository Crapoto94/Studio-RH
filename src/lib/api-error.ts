/**
 * Preserve the useful TLS cause hidden by Node's generic "fetch failed" error.
 */
export function formatApiFetchError(error: unknown): string {
  const err = error as { message?: string; cause?: { code?: string; message?: string } }
  const cause = err.cause
  const details = cause?.code || cause?.message
  const message = err.message || 'Erreur inconnue'

  if (cause?.code?.includes('UNRECOGNIZED_NAME') || /unrecognized name/i.test(cause?.message || '')) {
    return `${message} (SNI TLS refusé : le nom DNS de l'URL API ne correspond à aucun certificat/virtual host côté serveur)`
  }

  if (cause?.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
    return `${message} (certificat auto-signé non approuvé : configurez l'AC de la Ville via NODE_EXTRA_CA_CERTS puis redémarrez Node.js)`
  }

  return details ? `${message} (Cause: ${details})` : message
}

/** Enable the explicitly configured development bypass for the API Ville only. */
export function configureApiVilleTls(config: Record<string, string | undefined>): void {
  const insecure = config.API_VILLE_TLS_INSECURE || process.env.API_VILLE_TLS_INSECURE
  if (insecure?.toLowerCase() === 'true') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    console.warn('[API-VILLE] TLS certificate verification bypassed by API_VILLE_TLS_INSECURE=true')
  }
}
