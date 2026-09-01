/**
 * Danish Digital Post (NgDP - MeMo standard) Formatter & Simulator
 * Implements the MeddelelsesModel (MeMo) data structure defined by Digitaliseringsstyrelsen.
 */

import { FormSubmission, NgDpMemoConfig, MitIdCitizenSession } from '../types/schema';

export interface NgDpMeMoPayload {
  memoVersion: '1.2.0';
  messageUUID: string;
  transactionUUID: string;
  messageHeader: {
    messageType: 'DIGITALPOST' | 'NEM_SMS' | 'PHYSICAL_MAIL_FALLBACK';
    label: string;
    mandatory: boolean;
    legalNotification: boolean;
    createdDateTime: string;
    sender: {
      senderType: 'CVR';
      senderID: string;
      senderName: string;
      department?: string;
    };
    recipient: {
      recipientType: 'CPR' | 'CVR';
      recipientID: string;
      recipientName: string;
      address?: string;
      city?: string;
    };
    contactInformation: {
      contactPoint: string;
      telephoneNumber?: string;
      replyUrl?: string;
    };
  };
  mainDocument: {
    documentUUID: string;
    documentTitle: string;
    mimeType: 'text/html' | 'application/pdf' | 'application/json';
    contentHtml: string;
    summary: string;
    fileSizeKb: number;
  };
  additionalDocuments: Array<{
    documentUUID: string;
    documentTitle: string;
    mimeType: string;
    fileSizeKb: number;
    sourceField?: string;
  }>;
  technicalMetadata: {
    dispatchChannel: 'NgDP Direct Dispatch Broker (NemLog-in 3 / Digital Post)';
    securityLevel: 'Substantial (MitID LoA-3)';
    transmissionStatus: 'DELIVERED_TO_DISTRIBUTION_INFRASTRUCTURE';
    receiptId: string;
    digitalPostInboxTarget: 'e-Boks / Borger.dk / Mit.dk';
  };
}

/**
 * Replace variable tokens like {{fieldName}} with actual form answer values or user context.
 */
export function interpolateTokens(
  templateString: string,
  formData: Record<string, any>,
  userContext?: MitIdCitizenSession | null,
  extraMeta?: Record<string, any>
): string {
  if (!templateString) return '';

  return templateString.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (match, key) => {
    // Check extra metadata first
    if (extraMeta && key in extraMeta) {
      return String(extraMeta[key] ?? '');
    }

    // Check user context
    if (userContext) {
      if (key === 'cpr') return userContext.cpr || '';
      if (key === 'name' || key === 'fullName') return userContext.fullName || '';
      if (key === 'address') return userContext.address || '';
      if (key === 'city') return userContext.city || '';
      if (key === 'email') return userContext.email || '';
      if (key === 'phone') return userContext.phone || '';
      if (key === 'authLevel') return userContext.authLevel || '';
    }

    // Check form data
    if (formData && key in formData) {
      const val = formData[key];
      if (val === undefined || val === null) return '';
      if (typeof val === 'object') {
        if (Array.isArray(val)) return val.join(', ');
        return JSON.stringify(val);
      }
      return String(val);
    }

    return match;
  });
}

/**
 * Generate a standard Danish Digital Post (NgDP MeMo) payload.
 */
export function generateNgDpMeMoPayload(
  config: NgDpMemoConfig,
  formData: Record<string, any>,
  userContext?: MitIdCitizenSession | null,
  receiptNumber: string = `KVIT-${Date.now().toString().slice(-6)}`
): NgDpMeMoPayload {
  const recipientCprOrCvr = interpolateTokens(
    config.recipientCprOrCvrField || '{{cpr}}',
    formData,
    userContext
  );

  const recipientName = userContext?.fullName || formData.name || formData.applicantName || 'Borger / Virksomhed';
  const messageTitle = interpolateTokens(config.messageTitle, formData, userContext, { receiptNumber });

  const rawBody = interpolateTokens(
    config.memoDocument?.bodyTemplate || 'Hermed fremsendes officiel kvittering for din henvendelse.',
    formData,
    userContext,
    { receiptNumber }
  );

  // Wrap body in clean Danish public sector memo template HTML
  const contentHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 680px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h2 style="margin: 0 0 4px 0; color: #0f172a; font-size: 18px; font-weight: 700;">${config.senderName}</h2>
          <p style="margin: 0; font-size: 13px; color: #64748b;">CVR: ${config.senderCvr} &bull; Offentlig Digital Post (NgDP)</p>
        </div>
        <div style="text-align: right; font-size: 12px; color: #64748b;">
          <div>Dato: <strong>${new Date().toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></div>
          <div>Sags-/Kvit.nr: <strong>${receiptNumber}</strong></div>
        </div>
      </div>

      <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 6px 6px 0;">
        <div style="font-size: 13px; color: #64748b;">Modtager:</div>
        <div style="font-weight: 600; font-size: 15px; color: #0f172a;">${recipientName} (${recipientCprOrCvr || 'CPR/CVR registreret'})</div>
      </div>

      <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px;">
        ${messageTitle}
      </h1>

      <div style="font-size: 14px; color: #334155; margin-bottom: 24px; white-space: pre-line;">
        ${rawBody}
      </div>

      <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
        <h4 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Oversigt over indsendte formularoplysninger</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          ${Object.entries(formData)
            .filter(([k]) => !['password', 'secret'].includes(k.toLowerCase()))
            .map(
              ([key, val]) => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 6px 0; font-weight: 600; color: #475569; width: 40%;">${key}:</td>
                  <td style="padding: 6px 0; color: #0f172a;">${typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>
                </tr>
              `
            )
            .join('')}
        </table>
      </div>

      ${
        config.memoDocument?.legalNotice
          ? `
        <div style="font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 24px;">
          <strong>Retsvirkning:</strong> ${config.memoDocument.legalNotice}
        </div>
      `
          : ''
      }

      <div style="margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8;">
        Leveret sikkert via Digital Post infrastrukturen (NgDP) &bull; Signeret med MitID Substantial
      </div>
    </div>
  `;

  return {
    memoVersion: '1.2.0',
    messageUUID: `memo-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11)}`,
    transactionUUID: `trx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    messageHeader: {
      messageType: config.messageType === 'NEM_SMS' ? 'NEM_SMS' : config.messageType === 'PHYSICAL_MAIL_FALLBACK' ? 'PHYSICAL_MAIL_FALLBACK' : 'DIGITALPOST',
      label: messageTitle,
      mandatory: config.mandatory ?? true,
      legalNotification: true,
      createdDateTime: new Date().toISOString(),
      sender: {
        senderType: 'CVR',
        senderID: config.senderCvr || '29189846',
        senderName: config.senderName || 'Kommunal Forvaltning',
      },
      recipient: {
        recipientType: recipientCprOrCvr.includes('-') || recipientCprOrCvr.length === 10 ? 'CPR' : 'CVR',
        recipientID: recipientCprOrCvr || '120385-XXXX',
        recipientName: recipientName,
        address: userContext?.address,
        city: userContext?.city,
      },
      contactInformation: {
        contactPoint: 'Borgerservice & Digitale Selvbetjeninger',
        telephoneNumber: '+45 33 66 33 66',
        replyUrl: 'https://selvbetjening.kommune.dk',
      },
    },
    mainDocument: {
      documentUUID: `doc-${Date.now()}`,
      documentTitle: config.memoDocument?.mainDocumentTitle || messageTitle,
      mimeType: 'text/html',
      contentHtml,
      summary: rawBody.slice(0, 160) + '...',
      fileSizeKb: Math.max(12, Math.round(contentHtml.length / 1024)),
    },
    additionalDocuments: (config.memoDocument?.attachments || []).map((att, idx) => ({
      documentUUID: `att-${Date.now()}-${idx}`,
      documentTitle: att,
      mimeType: 'application/pdf',
      fileSizeKb: 45,
    })),
    technicalMetadata: {
      dispatchChannel: 'NgDP Direct Dispatch Broker (NemLog-in 3 / Digital Post)',
      securityLevel: 'Substantial (MitID LoA-3)',
      transmissionStatus: 'DELIVERED_TO_DISTRIBUTION_INFRASTRUCTURE',
      receiptId: receiptNumber,
      digitalPostInboxTarget: 'e-Boks / Borger.dk / Mit.dk',
    },
  };
}
