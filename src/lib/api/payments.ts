import { getSupabase } from '../supabase';
import type { Payment, PaymentType } from '../types';

export async function fetchPaymentsByBooking(bookingId: string): Promise<Payment[]> {
  const { data, error } = await getSupabase()
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .order('payment_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export type CreatePaymentInput = {
  booking_id: string;
  amount: number;
  payment_type: PaymentType;
  notes?: string;
  payment_date?: string;
};

export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  const { data, error } = await getSupabase()
    .from('payments')
    .insert({
      booking_id: input.booking_id,
      amount: input.amount,
      payment_type: input.payment_type,
      notes: input.notes || null,
      payment_date: input.payment_date,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create payment');
  return data;
}

export type UpdatePaymentInput = {
  amount: number;
  payment_type: PaymentType;
  notes?: string;
};

export async function updatePayment(paymentId: string, input: UpdatePaymentInput): Promise<Payment> {
  const { data, error } = await getSupabase()
    .from('payments')
    .update({ amount: input.amount, payment_type: input.payment_type, notes: input.notes || null })
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Payment not found');
  return data;
}

export async function deletePayment(paymentId: string): Promise<void> {
  const { error } = await getSupabase().from('payments').delete().eq('id', paymentId);
  if (error) throw error;
}

export async function fetchCollectedTotal(bookingId: string): Promise<number> {
  const { data, error } = await getSupabase().from('payments').select('amount').eq('booking_id', bookingId);
  if (error) throw error;
  return (data ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
}
