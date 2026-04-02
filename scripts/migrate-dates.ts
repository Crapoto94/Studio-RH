import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseFrenchDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }
  const iso = new Date(dateStr);
  if (!isNaN(iso.getTime())) return iso;
  return null;
}

async function migrate() {
  console.log('--- DÉBUT DE LA MIGRATION DES DATES ---');
  const agents = await prisma.refAgent.findMany();
  let count = 0;

  for (const agent of agents) {
    let updateNeeded = false;
    const data: any = {};
    const a = agent as any;

    if (a.date_arrivee && typeof a.date_arrivee === 'string' && !a.date_arrivee.includes('T')) {
      const d = parseFrenchDate(a.date_arrivee);
      if (d) {
        data.date_arrivee = d;
        updateNeeded = true;
      }
    }

    if (a.date_depart && typeof a.date_depart === 'string' && !a.date_depart.includes('T')) {
      const d = parseFrenchDate(a.date_depart);
      if (d) {
        data.date_depart = d;
        updateNeeded = true;
      }
    }

    if (updateNeeded) {
      await prisma.refAgent.update({
        where: { id: agent.id },
        data
      });
      count++;
    }
  }

  console.log(`--- FIN : ${count} agents mis à jour ---`);
}

migrate()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
