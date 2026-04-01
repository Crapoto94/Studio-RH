import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
})

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'RH Studio',
      credentials: {
        login: { label: 'Identifiant', type: 'text' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.appUser.findUnique({
          where: { login: parsed.data.login },
        })
        if (!user || !user.actif) return null

        // Simple password check (in production: use bcrypt)
        if (user.password !== parsed.data.password) return null

        return {
          id: String(user.id),
          name: `${user.prenom} ${user.nom}`,
          email: user.login,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).role = token.role
        ;(session.user as any).id = token.sub
      }
      return session
    },
  },
}
