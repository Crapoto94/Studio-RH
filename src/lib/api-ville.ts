import { prisma, prismaLocal } from './db';
import { randomUUID } from 'crypto';
import { configureApiVilleTls } from './api-error';

interface EmailOptions {
  to: string;
  subject: string;
  body?: string;
  template_name?: string;
  variables?: Record<string, string>;
  onboarding_id?: number;
  attachments?: { filename: string, content: string }[];
}

/**
 * Envoie un email via l'API Ville avec un système de template et de log immédiat.
 */
export async function sendEmailWithTemplate(options: EmailOptions): Promise<boolean> {
  let logId: number | null = null;
  
  try {
    // 1. Récupération des paramètres par CLÉS
    const params = await prismaLocal.parametre.findMany({
      where: {
        cle: {
          in: ['API_VILLE_URL', 'API_VILLE_TOKEN', 'MAIL_TEMPLATE_HTML', 'MAIL_SENDER_NAME', 'MAIL_SENDER_EMAIL']
        }
      }
    });

    const config = Object.fromEntries(params.map(p => [p.cle, p.valeur]));
    configureApiVilleTls(config);
    
    let apiUrl = config['API_VILLE_URL'] || process.env.API_VILLE_URL || 'https://api.ivry.local/api';
    const apiToken = config['API_VILLE_TOKEN'] || process.env.API_VILLE_TOKEN;
    const globalTemplate = config['MAIL_TEMPLATE_HTML'] || '<html><body>{{CONTENT}}</body></html>';
    const senderName = config['MAIL_SENDER_NAME'] || 'RH Studio';
    const senderEmail = config['MAIL_SENDER_EMAIL'] || 'dsihub@fbc.fr';

    // 2. Préparation du contenu (Remplacement des variables dans le message)
    let bodyContent = options.body || '';
    if (options.variables) {
      Object.entries(options.variables).forEach(([key, value]) => {
        // Regex plus robuste : gère la casse et les espaces insécables potentiels
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
        bodyContent = bodyContent.replace(regex, value || '');
      });
    }

    // 3. Injection dans le template global (Regex pour {{CONTENT}} au cas où il y ait du style autour)
    let finalHtml = globalTemplate;
    if (globalTemplate.match(/{{\s*CONTENT\s*}}/i)) {
      finalHtml = globalTemplate.replace(/{{\s*CONTENT\s*}}/i, bodyContent);
    } else {
      finalHtml = bodyContent;
    }

    // 4. Logging PRÉVENTIF
    const emailLog = await (prisma.emailLog as any).create({
      data: {
        to: options.to,
        subject: options.subject,
        body: finalHtml,
        status: 'PENDING',
        onboarding_id: options.onboarding_id
      }
    });
    logId = emailLog.id;

    // 5. Appel de l'API Ville (Endpoint corrigé /v1/mail/send comme demandé)
    if (!apiUrl.includes('/api')) apiUrl += '/api';
    const endpoint = `${apiUrl}/v1/mail/send`;
    
    console.log(`[API-VILLE-DEBUG] Tentative envoi à ${options.to} via ${endpoint}`);
    
    const payload = {
      to: options.to,
      subject: options.subject,
      content: finalHtml,
      from_name: senderName,
      from_email: senderEmail,
      attachments: options.attachments || []
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiToken || ''
      },
      body: JSON.stringify(payload)
    });


    const success = res.ok;
    const errorMsg = !success ? `HTTP Error ${res.status}: ${await res.text().catch(() => 'Unknown error')}` : null;

    if (!success) {
      console.error(`[API-VILLE-ERROR] L'API a retourné une erreur: ${errorMsg}`);
    } else {
      console.log(`[API-VILLE-DEBUG] Email envoyé avec succès via Ivory v1/notifications.`);
    }

    // 5. Mise à jour du log final
    if (logId) {
      await (prisma.emailLog as any).update({
        where: { id: logId },
        data: {
          status: success ? 'SUCCESS' : 'FAILURE',
          error: errorMsg
        }
      });
    }

    return success;

  } catch (error: any) {
    console.error('[API-VILLE-CRITICAL-ERROR]', error.message);
    
    // Tentative de log de l'erreur fatale
    if (logId) {
      await (prisma.emailLog as any).update({
        where: { id: logId },
        data: {
          status: 'FAILURE',
          error: `EXCEPTION: ${error.message}`
        }
      }).catch(() => {});
    }
    
    return false;
  }
}

