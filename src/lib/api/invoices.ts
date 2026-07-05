import { getSupabase } from '../supabase';
import type { Invoice } from '../types';

export async function fetchInvoiceByBooking(bookingId: string): Promise<Invoice | null> {
  const { data, error } = await getSupabase().from('invoices').select('*').eq('booking_id', bookingId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getOrCreateInvoiceNumber(bookingId: string): Promise<string> {
  const existing = await fetchInvoiceByBooking(bookingId);
  if (existing) return existing.invoice_number;

  const year = new Date().getFullYear();
  const { data: numberData, error: rpcError } = await getSupabase().rpc('next_invoice_number', { p_year: year });
  if (rpcError) throw rpcError;

  const invoiceNumber = numberData as string;
  const { error: insertError } = await getSupabase().from('invoices').insert({ booking_id: bookingId, invoice_number: invoiceNumber });
  if (insertError) throw insertError;

  return invoiceNumber;
}

export async function fetchAllInvoices(): Promise<Invoice[]> {
  const { data, error } = await getSupabase().from('invoices').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
