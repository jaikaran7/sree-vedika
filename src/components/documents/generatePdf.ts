import { createRoot } from 'react-dom/client';
import { createElement, type ReactElement } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QuotationTemplate } from './QuotationTemplate';
import { InvoiceTemplate } from './InvoiceTemplate';
import { getOrCreateInvoiceNumber } from '../../lib/api/invoices';
import { getOrCreateQuotation } from '../../lib/api/quotations';
import type { BookingWithTotals, Payment } from '../../lib/types';

async function renderToPdf(node: ReactElement, filename: string) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '-10000px';
  container.style.zIndex = '-1';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(node);

  await new Promise((resolve) => setTimeout(resolve, 150));
  if (document.fonts?.ready) await document.fonts.ready;

  try {
    const target = container.firstElementChild as HTMLElement;
    const canvas = await html2canvas(target, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
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

    pdf.save(filename);
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}

export async function downloadQuotation(booking: BookingWithTotals) {
  const { quotationNumber, validUntil } = await getOrCreateQuotation(booking.id);
  const filename = `Quotation-${quotationNumber}.pdf`;
  await renderToPdf(
    createElement(QuotationTemplate, { booking, quotationNumber, validUntil }),
    filename,
  );
}

export async function downloadInvoice(booking: BookingWithTotals, payments: Payment[]) {
  const invoiceNumber = await getOrCreateInvoiceNumber(booking.id);
  const filename = `Invoice-${invoiceNumber}.pdf`;
  await renderToPdf(createElement(InvoiceTemplate, { booking, payments, invoiceNumber }), filename);
}
