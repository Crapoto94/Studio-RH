import { prisma } from '../src/lib/db'

async function research() {
  console.log("--- RECHERCHE AGENT CADINOT ---")
  const agents = await prisma.refAgent.findMany({
    where: { nom: { contains: 'CADINOT', mode: 'insensitive' } }
  })
  console.log("Agents trouvés:", JSON.stringify(agents, null, 2))

  console.log("\n--- RECHERCHE COMPTE AD SSDCC ---")
  const ad = await prisma.brutAd.findMany({
    where: { sam_account: 'SSDCC' }
  })
  console.log("AD trouvé:", JSON.stringify(ad, null, 2))

  console.log("\n--- RECHERCHE LIENS EXISTANTS ---")
  const linked = await prisma.refAgent.findMany({
    where: { ad_id: 'SSDCC' }
  })
  console.log("Agents déjà liés à SSDCC:", JSON.stringify(linked, null, 2))

  const secondary = await prisma.extraAdLink.findMany({
    where: { sam_account: 'SSDCC' }
  })
  console.log("Liens secondaires vers SSDCC:", JSON.stringify(secondary, null, 2))
}

research()
  .catch(console.error)
  .finally(() => process.exit(0))
