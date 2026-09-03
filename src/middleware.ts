import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Admin-only routes
    const adminRoutes = ['/parametres', '/sql']
    if (adminRoutes.some(r => pathname.startsWith(r)) && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// NB : chaque alternative de la negative lookahead est testee comme un
// PREFIXE (pas d'ancre implicite), donc "api/onboarding" tout court
// exclurait aussi /api/onboarding/{id}, /api/onboarding/{id}/resend, etc.
// (routes session-only, qui doivent RESTER protegees) — d'ou les ancres $
// explicites sur les routes a cle API (agents/search, onboarding
// bare pour POST creation + GET ?mode=futurs, onboarding/tasks/{id} pour
// l'acquittement PATCH) afin de ne matcher QUE ces chemins precis et pas
// leurs sous-routes.
export const config = {
  matcher: ['/((?!login|api/auth|api/swagger|api/openapi.json|api/routes|api/agents/presence|api/agents/search$|onboarding/form|onboarding/manager|api/onboarding$|api/onboarding/tasks/[^/]+$|api/onboarding/public|api/onboarding/search-agents|api/onboarding/manager|api/synchro|_next|favicon.ico|unauthorized).*)'],
}
