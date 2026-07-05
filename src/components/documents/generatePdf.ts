import { createRoot } from 'react-dom/client';
import { createElement, type ReactElement } from 'react';
import { QuotationTemplate } from './QuotationTemplate';
import { InvoiceTemplate } from './InvoiceTemplate';
import { getOrCreateInvoiceNumber } from '../../lib/api/invoices';
import { getOrCreateQuotation } from '../../lib/api/quotations';
import { captureElementToPdf, downloadPdf } from './documentActions';
import type { BookingWithTotals, Payment } from '../../lib/types';

/** Renders a document off-screen and captures it as PDF (legacy direct-download path). */
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
    const pdf = await captureElementToPdf(target, filename);
    downloadPdf(pdf);
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}

export async function downloadQuotation(booking: BookingWithTotals) {
  const { quotationNumber, validUntil } = await getOrCreateQuotation(booking.id);
  const filename = `Quotation-${quotationNumber}.pdf`;
  await renderToPdf(createElement(QuotationTemplate, { booking, quotationNumber, validUntil }), filename);
}

export async function downloadInvoice(booking: BookingWithTotals, payments: Payment[]) {
  const invoiceNumber = await getOrCreateInvoiceNumber(booking.id);
  const filename = `Invoice-${invoiceNumber}.pdf`;
  await renderToPdf(createElement(InvoiceTemplate, { booking, payments, invoiceNumber }), filename);
}
