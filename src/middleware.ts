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

export const config = {
  matcher: ['/((?!login|api/auth|onboarding/form|onboarding/manager|api/onboarding/public|api/onboarding/search-agents|api/onboarding/manager|_next|favicon.ico|unauthorized).*)'],
}
