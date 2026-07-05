import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { normalizePhoneForLink } from '../../lib/format';

export type DocumentType = 'quotation' | 'invoice';

export interface DocumentPdfResult {
  blob: Blob;
  filename: string;
}

export function buildWhatsAppMessage(customerName: string, docType: DocumentType): string {
  const docLabel = docType === 'quotation' ? 'quotation' : 'invoice';
  return [
    `Hello ${customerName},`,
    '',
    'Thank you for choosing Sree Vedika Convention Hall.',
    '',
    `Please find your ${docLabel} attached.`,
    '',
    'Regards,',
    'Sree Vedika Convention Hall',
  ].join('\n');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${normalizePhoneForLink(phone)}?text=${encodeURIComponent(message)}`;
}

export async function captureElementToPdf(element: HTMLElement, filename: string): Promise<DocumentPdfResult> {
  if (document.fonts?.ready) await document.fonts.ready;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = (canvas.height * pageWidth) / canvas.width;

  let heightLeft = pageHeight;
  let position = 0;
  pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, pageHeight);
  heightLeft -= pdf.internal.pageSize.getHeight();

  while (heightLeft > 0) {
    position = heightLeft - pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, pageHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();
  }

  return { blob: pdf.output('blob'), filename };
}

export function downloadPdf({ blob, filename }: DocumentPdfResult): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Opens the browser print dialog for the in-app document preview. */
export function printDocumentPreview(): void {
  document.body.classList.add('printing-document');
  const cleanup = () => {
    document.body.classList.remove('printing-document');
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  window.print();
}

/**
 * Web WhatsApp cannot auto-attach files. Downloads the PDF, opens the chat with a
 * pre-filled message, and returns so the caller can prompt the user to attach it.
 * Structured for future native share (Capacitor / React Native) via shareDocument().
 */
export async function shareDocumentViaWhatsApp(params: {
  phone: string;
  customerName: string;
  docType: DocumentType;
  pdf: DocumentPdfResult;
}): Promise<void> {
  downloadPdf(params.pdf);
  const message = buildWhatsAppMessage(params.customerName, params.docType);
  const url = buildWhatsAppUrl(params.phone, message);
  window.open(url, '_blank', 'noopener,noreferrer');
}
