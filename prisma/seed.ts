import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Admin User
  const admin = await prisma.appUser.upsert({
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
  })
