import { getSupabase } from '../supabase';
import { calcTotalBookingValue, getEffectiveTotalBookingValue, calcPending } from '../bookingTotals';
import { isUniqueViolation } from './errors';
import type { Booking, BookingSlot, BookingWithTotals, DecorationType, PaymentMethod } from '../types';

function withTotals(
  booking: Booking,
  collected: number,
  collectedCash: number,
  collectedOnline: number,
): BookingWithTotals {
  const total = getEffectiveTotalBookingValue(booking);
  return {
    ...booking,
    collected,
    collectedCash,
    collectedOnline,
    pending: calcPending(total, collected),
  };
}

export async function fetchAllBookingsWithTotals(): Promise<BookingWithTotals[]> {
  const [{ data: bookings, error: bookingsError }, { data: payments, error: paymentsError }] = await Promise.all([
    getSupabase().from('bookings').select('*').order('booking_date', { ascending: true }),
    getSupabase().from('payments').select('booking_id, amount, payment_method'),
  ]);

  if (bookingsError) throw bookingsError;
  if (paymentsError) throw paymentsError;

  const totalsByBooking = new Map<string, { collected: number; cash: number; online: number }>();
  for (const p of payments ?? []) {
    const cur = totalsByBooking.get(p.booking_id) ?? { collected: 0, cash: 0, online: 0 };
    const amount = Number(p.amount);
    cur.collected += amount;
    if (p.payment_method === 'online') cur.online += amount;
    else cur.cash += amount;
    totalsByBooking.set(p.booking_id, cur);
  }

  return (bookings ?? []).map((b) => {
    const t = totalsByBooking.get(b.id) ?? { collected: 0, cash: 0, online: 0 };
    return withTotals(b as Booking, t.collected, t.cash, t.online);
  });
}

export async function fetchBookingWithTotals(id: string): Promise<BookingWithTotals | null> {
  const [{ data: booking, error: bookingError }, { data: payments, error: paymentsError }] = await Promise.all([
    getSupabase().from('bookings').select('*').eq('id', id).maybeSingle(),
    getSupabase().from('payments').select('amount, payment_method').eq('booking_id', id),
  ]);

  if (bookingError) throw bookingError;
  if (paymentsError) throw paymentsError;
  if (!booking) return null;

  let collected = 0;
  let collectedCash = 0;
  let collectedOnline = 0;
  for (const p of payments ?? []) {
    const amount = Number(p.amount);
    collected += amount;
    if (p.payment_method === 'online') collectedOnline += amount;
    else collectedCash += amount;
  }
  return withTotals(booking as Booking, collected, collectedCash, collectedOnline);
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
  kitchen_required: boolean;
  kitchen_amount: number;
  decoration_type: DecorationType;
  decorator_vendor: string | null;
  decoration_amount: number;
  royalty_fee: number;
  advance: number;
  payment_date?: string;
  payment_method?: PaymentMethod;
};

export type CreateBookingResult =
  | { ok: true; booking: Booking }
  | { ok: false; reason: 'slot_taken' | 'error'; message?: string };

export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  const available = await checkSlotAvailability(input.booking_date, input.booking_slot);
  if (!available) return { ok: false, reason: 'slot_taken' };

  const total_booking_value = calcTotalBookingValue(input);

  const { data: booking, error: insertError } = await getSupabase()
    .from('bookings')
    .insert({
      customer_name: input.customer_name,
      phone: input.phone,
      booking_date: input.booking_date,
      booking_slot: input.booking_slot,
      budget: input.budget,
      kitchen_required: input.kitchen_required,
      kitchen_amount: input.kitchen_required ? input.kitchen_amount : 0,
      decoration_type: input.decoration_type,
      decorator_vendor: input.decoration_type === 'in_house' ? input.decorator_vendor : null,
      decoration_amount: input.decoration_type === 'in_house' ? input.decoration_amount : 0,
      royalty_fee: input.decoration_type === 'outside' ? input.royalty_fee : 0,
      total_booking_value,
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
      payment_date: input.payment_date,
      payment_method: input.payment_method ?? 'cash',
    });
    if (paymentError) return { ok: false, reason: 'error', message: paymentError.message };
  }

  return { ok: true, booking: booking as Booking };
}

export type UpdateBookingInput = {
  customer_name?: string;
  phone?: string;
  booking_date?: string;
  booking_slot?: BookingSlot;
  budget?: number;
  kitchen_required?: boolean;
  kitchen_amount?: number;
  decoration_type?: DecorationType;
  decorator_vendor?: string | null;
  decoration_amount?: number;
  royalty_fee?: number;
  total_booking_value?: number;
};

export async function updateBooking(id: string, input: UpdateBookingInput): Promise<Booking> {
  if (input.booking_date && input.booking_slot) {
    const available = await checkSlotAvailability(input.booking_date, input.booking_slot, id);
    if (!available) throw new Error('This slot is already booked.');
  }

  const { data, error } = await getSupabase().from('bookings').update(input).eq('id', id).select().single();
  if (error) throw error;
  if (!data) throw new Error('Booking not found');
  return data as Booking;
}

export async function cancelBooking(id: string): Promise<void> {
  const { error } = await getSupabase().from('bookings').update({ status: 'cancelled' }).eq('id', id);
  if (error) throw error;
}

export async function deleteBooking(id: string): Promise<void> {
  const { error } = await getSupabase().from('bookings').delete().eq('id', id);
  if (error) throw error;
}
