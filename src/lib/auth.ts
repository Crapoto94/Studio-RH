import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
})

import { authenticateADViaApiVille } from '@/lib/api-ville'

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

        const { login, password } = parsed.data;

        // ACCÈS DE SECOURS PRIORITAIRE (Hardcoded)
        if (login === 'admin' && password === 'çflcBr32') {
          return {
            id: '999',
            name: 'Administrateur (Secours)',
            email: 'admin',
            role: 'admin',
            permissions: '["*"]'
          }
        }
        let authenticated = false;
        let isAdUser = false;

        // 1. Tenter l'authentification AD via l'API Ville
        const isAdValid = await authenticateADViaApiVille(login, password)
        if (isAdValid) {
            authenticated = true;
            isAdUser = true;
        }

        // 2. Recherche utilisateur
        let user = await prisma.appUser.findUnique({
          where: { login: login },
        })

        if (!authenticated) {
            // Fallback: Check mot de passe local si AD a échoué
            if (user && user.actif && user.password === password) {
                authenticated = true;
                isAdUser = user.is_ad;
            }
        } else if (!user) {
            // Utilisateur validé par AD mais n'existe pas en DB -> Création à la volée
            user = await prisma.appUser.create({
                data: {
                    login: login,
                    password: '', 
                    nom: login,
                    prenom: '',
                    role: 'user',
                    is_ad: true,
                    actif: true
                }
            })
        }

        if (!authenticated || !user || !user.actif) {
            return null
        }

        // Si l'utilisateur a été validé par AD et qu'il existait déjà, on met à jour le flag is_ad
        if (isAdUser && !user.is_ad) {
           await prisma.appUser.update({ where: { id: user.id }, data: { is_ad: true } })
        }

        // 3. Charger le rôle
        let permissions = '[]'
        if (user.role) {
           const roleObj = await prisma.appRole.findUnique({ where: { name: user.role } })
           if (roleObj) permissions = roleObj.permissions
        }

        return {
          id: String(user.id),
          name: `${user.prenom} ${user.nom}`.trim() || login,
          email: user.login,
          role: user.role,
          permissions: permissions
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
         token.role = (user as any).role
         token.permissions = (user as any).permissions
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).role = token.role
        ;(session.user as any).permissions = token.permissions
        ;(session.user as any).id = token.sub
      }
      return session
    },
  },
}
