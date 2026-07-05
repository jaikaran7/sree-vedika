import { supabase } from './supabase';

export async function getOrCreateInvoiceNumber(bookingId: string): Promise<string> {
  const { data: existing, error: existingError } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('booking_id', bookingId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing.invoice_number;

  const year = new Date().getFullYear();
  const { data: numberData, error: rpcError } = await supabase.rpc('next_invoice_number', { p_year: year });
  if (rpcError) throw rpcError;

  const invoiceNumber = numberData as string;
  const { error: insertError } = await supabase.from('invoices').insert({ booking_id: bookingId, invoice_number: invoiceNumber });
  if (insertError) throw insertError;

  return invoiceNumber;
}
