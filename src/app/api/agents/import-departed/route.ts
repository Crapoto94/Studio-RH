import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

function parseDate(dateStr: string) {
  if (!dateStr) return null;
  const parts = dateStr.split(' ');
  const datePart = parts[0];
  const timePart = parts[1] || '00:00:00';
  const [dd, mm, yyyy] = datePart.split('/');
  if (!dd || !mm || !yyyy) return null;
  return new Date(`${yyyy}-${mm}-${dd}T${timePart}.000Z`);
}

function parseCSVLine(line: string) {
  if (!line || !line.trim()) return null;
  line = line.trim();
  
  if (line.startsWith('"') && line.endsWith('"')) {
    line = line.substring(1, line.length - 1);
  } else if(line.startsWith('"')) {
     line = line.substring(1);
  } else if (line.endsWith('"')) {
     line = line.substring(0, line.length - 1);
  }
  
  const fields = line.split('";"');
  return fields.map(f => {
    let clean = f.trim();
    if (clean.startsWith('="') && clean.endsWith('"')) {
      clean = clean.substring(2, clean.length - 1);
    }
    return clean;
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n')
    let headers: string[] = [];
    
    if (lines.length > 0) {
        headers = parseCSVLine(lines[0]) || [];
        lines.shift();
    }

    const getField = (row: string[], name: string) => {
        const idx = headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
        return idx >= 0 ? row[idx] : undefined;
    };

    let processedCount = 0;
    const now = new Date();

    for (const line of lines) {
      const row = parseCSVLine(line);
      if (!row || row.length < Math.min(3, headers.length)) continue;

      const matricule = getField(row, 'matricule');
      if (!matricule) continue;

      const nom = getField(row, 'last_name') || '';
      const prenom = getField(row, 'first_name') || '';
      const departureDateRaw = getField(row, 'departure_date');
      const direction = getField(row, 'direction') || null;
      const service = getField(row, 'service') || null;
      const position_l = getField(row, 'position') || 'Parti';

      const departureDate = departureDateRaw ? parseDate(departureDateRaw) : null;

      const existing = await prisma.refAgent.findUnique({
        where: { matricule }
      });

      const updateData: any = {
        actif: false,
        nom,
        prenom,
        position_l,
        nom_direction: direction,
        nom_service: service,
      };

      if (departureDate) {
        updateData.date_depart = departureDate;
      } else {
        updateData.plus_vu = now;
      }

      if (existing) {
        await prisma.refAgent.update({
          where: { id: existing.id },
          data: updateData
        });
      } else {
        // En accord avec les souhaits de l'utilisateur, créer si n'existe pas.
        await prisma.refAgent.create({
          data: {
            ...updateData,
            matricule,
          }
        });
      }
      processedCount++;
    }

    await prisma.audit.create({
      data: {
        user_id: parseInt(session.user.id),
        action: 'import_departed_agents',
        target: file.name,
        details: JSON.stringify({ count: processedCount })
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Fichier importé avec succès',
      count: processedCount
    })

  } catch (error: any) {
    console.error('Erreur import CSV:', error);
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
