import { PrismaClient } from '@prisma/client'
import { PrismaClient as PrismaLocalClient } from '../src/generated/local-client'

const prisma = new PrismaClient()
const prismaLocal = new PrismaLocalClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Admin User in local SQLite database
  const admin = await (prismaLocal as any).appUser.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      login: 'admin',
      password: 'admin', // Simple password for now
      nom: 'Administrateur',
      prenom: 'Admin',
      role: 'admin',
      actif: true
    }
  })

  console.log('✅ Admin user created: admin / admin')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await prismaLocal.$disconnect()
  })
