import { getSupabase } from '../supabase';
import { isUniqueViolation } from './errors';
import type { Booking, BookingSlot, BookingWithTotals } from '../types';

export async function fetchAllBookingsWithTotals(): Promise<BookingWithTotals[]> {
  const [{ data: bookings, error: bookingsError }, { data: payments, error: paymentsError }] = await Promise.all([
    getSupabase().from('bookings').select('*').order('booking_date', { ascending: true }),
    getSupabase().from('payments').select('booking_id, amount'),
  ]);

  if (bookingsError) throw bookingsError;
  if (paymentsError) throw paymentsError;

  const collectedByBooking = new Map<string, number>();
  for (const p of payments ?? []) {
    collectedByBooking.set(p.booking_id, (collectedByBooking.get(p.booking_id) ?? 0) + Number(p.amount));
  }

  return (bookings ?? []).map((b) => {
    const collected = collectedByBooking.get(b.id) ?? 0;
    return { ...b, collected, pending: Number(b.budget) - collected };
  });
}

export async function fetchBookingWithTotals(id: string): Promise<BookingWithTotals | null> {
  const [{ data: booking, error: bookingError }, { data: payments, error: paymentsError }] = await Promise.all([
    getSupabase().from('bookings').select('*').eq('id', id).maybeSingle(),
    getSupabase().from('payments').select('amount').eq('booking_id', id),
  ]);

  if (bookingError) throw bookingError;
  if (paymentsError) throw paymentsError;
  if (!booking) return null;

  const collected = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  return { ...booking, collected, pending: Number(booking.budget) - collected };
}

export async function checkSlotAvailability(
  date: string,
  slot: BookingSlot,
  excludeBookingId?: string,
): Promise<boolean> {
  let query = getSupabase()
    .from('bookings')
    .select('id')
    .eq('booking_date', date)
    .eq('booking_slot', slot)
    .neq('status', 'cancelled');

  if (excludeBookingId) query = query.neq('id', excludeBookingId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).length === 0;
}

export type CreateBookingInput = {
  customer_name: string;
  phone: string;
  booking_date: string;
  booking_slot: BookingSlot;
  budget: number;
  advance: number;
};

export type CreateBookingResult =
  | { ok: true; booking: Booking }
  | { ok: false; reason: 'slot_taken' | 'error'; message?: string };

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const available = await checkSlotAvailability(input.booking_date, input.booking_slot);
  if (!available) return { ok: false, reason: 'slot_taken' };

  const { data: booking, error: insertError } = await getSupabase()
    .from('bookings')
    .insert({
      customer_name: input.customer_name,
      phone: input.phone,
      booking_date: input.booking_date,
      booking_slot: input.booking_slot,
      budget: input.budget,
    })
    .select()
    .single();

  if (insertError || !booking) {
    if (isUniqueViolation(insertError)) return { ok: false, reason: 'slot_taken' };
    return { ok: false, reason: 'error', message: insertError?.message };
  }

  if (input.advance > 0) {
    const { error: paymentError } = await getSupabase().from('payments').insert({
      booking_id: booking.id,
      amount: input.advance,
      payment_type: 'advance',
      notes: null,
    });
    if (paymentError) return { ok: false, reason: 'error', message: paymentError.message };
  }

  return { ok: true, booking };
}

export type UpdateBookingInput = {
  customer_name?: string;
  phone?: string;
  booking_date?: string;
  booking_slot?: BookingSlot;
  budget?: number;
};

export async function updateBooking(id: string, input: UpdateBookingInput): Promise<Booking> {
  if (input.booking_date && input.booking_slot) {
    const available = await checkSlotAvailability(input.booking_date, input.booking_slot, id);
    if (!available) throw new Error('This slot is already booked.');
  }

  const { data, error } = await getSupabase().from('bookings').update(input).eq('id', id).select().single();
  if (error) throw error;
  if (!data) throw new Error('Booking not found');
  return data;
}

export async function cancelBooking(id: string): Promise<void> {
  const { error } = await getSupabase().from('bookings').update({ status: 'cancelled' }).eq('id', id);
  if (error) throw error;
}

export async function deleteBooking(id: string): Promise<void> {
  const { error } = await getSupabase().from('bookings').delete().eq('id', id);
  if (error) throw error;
}
