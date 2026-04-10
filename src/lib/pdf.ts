import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { prisma, prismaLocal } from './db';
import { formatDate, formatPrenom } from './utils';

/**
 * Génère un PDF récapitulatif des demandes d'onboarding.
 * @param onboardingId 
 * @returns Base64 string of the PDF
 */
export async function generateOnboardingPDF(onboardingId: number): Promise<string> {
  const onboarding = await prisma.onboarding.findUnique({
    where: { id: onboardingId },
    include: { agent: true, manager: true }
  });

  if (!onboarding) throw new Error('Onboarding non trouvé');

  // Récupérer la config du formulaire pour les labels
  const configParam = await prismaLocal.parametre.findUnique({ where: { cle: 'ONBOARDING_FORM_CONFIG' } });
  const formConfig = JSON.parse(configParam?.valeur || '[]');
  const responses = JSON.parse(onboarding.reponses_formulaire || '{}');

  const doc = new jsPDF() as any;
  const margin = 20;
  let yPos = 20;

  // Header
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Mairie d\'Ivry-sur-Seine - DSI', margin, yPos);
  
  yPos += 10;
  doc.setFontSize(22);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('Récapitulatif Onboarding', margin, yPos);
  
  yPos += 15;
  doc.setFontSize(12);
  doc.setTextColor(80);
  const agentName = onboarding.agent 
    ? `${onboarding.agent.prenom} ${onboarding.agent.nom}`.toUpperCase()
    : `${onboarding.prenom_temp} ${onboarding.nom_temp}`.toUpperCase();
  doc.text(`Candidat : ${agentName}`, margin, yPos);
  
  yPos += 7;
  doc.text(`Date d'arrivée : ${formatDate(onboarding.date_arrivee_prevue) || 'À définir'}`, margin, yPos);

  yPos += 15;

  // Préparation du tableau de données
  const tableData: any[][] = [];
  
  formConfig.forEach((field: any) => {
    if (field.type === 'title' || field.type === 'section') {
      tableData.push([{ content: field.label.toUpperCase(), colSpan: 2, styles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' } }]);
    } else {
      const value = responses[field.id];
      if (value !== undefined && value !== null && value !== '' && value !== false) {
          let displayValue = String(value);
          if (value === true) displayValue = 'Oui';
          tableData.push([field.label, displayValue]);
      }
    }
  });

  doc.autoTable({
    startY: yPos,
    head: [['Champ', 'Valeur']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
    margin: { left: margin, right: margin },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', width: 80 },
      1: { cellWidth: 'auto' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Document généré le ${new Date().toLocaleString()} par RH Studio`, margin, finalY);

  // Return base64
  const pdfOutput = doc.output('datauristring').split(',')[1];
  return pdfOutput;
}
