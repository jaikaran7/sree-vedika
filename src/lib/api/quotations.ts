import { addDays, format } from 'date-fns';
import { getSupabase } from '../supabase';
import type { Quotation } from '../types';

const QUOTATION_VALIDITY_DAYS = 7;

export async function fetchQuotationByBooking(bookingId: string): Promise<Quotation | null> {
  const { data, error } = await getSupabase().from('quotations').select('*').eq('booking_id', bookingId).maybeSingle();
  if (error) throw error;
  return data;
}

export type QuotationRecord = {
  quotationNumber: string;
  validUntil: string;
};

export async function getOrCreateQuotation(bookingId: string): Promise<QuotationRecord> {
  const existing = await fetchQuotationByBooking(bookingId);
  if (existing) {
    return { quotationNumber: existing.quotation_number, validUntil: existing.valid_until };
  }

  const year = new Date().getFullYear();
  const { data: numberData, error: rpcError } = await getSupabase().rpc('next_quotation_number', { p_year: year });
  if (rpcError) throw rpcError;

  const quotationNumber = numberData as string;
  const validUntil = format(addDays(new Date(), QUOTATION_VALIDITY_DAYS), 'yyyy-MM-dd');

  const { error: insertError } = await getSupabase().from('quotations').insert({
    booking_id: bookingId,
    quotation_number: quotationNumber,
    valid_until: validUntil,
  });
  if (insertError) throw insertError;

  return { quotationNumber, validUntil };
}

export async function fetchAllQuotations(): Promise<Quotation[]> {
  const { data, error } = await getSupabase().from('quotations').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
