import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getBookingStatus } from '../lib/bookingStatus';
import type { Booking, BookingSlot, BookingWithTotals } from '../lib/types';

async function fetchBookingsWithTotals(): Promise<BookingWithTotals[]> {
  const [{ data: bookings, error: bookingsError }, { data: payments, error: paymentsError }] = await Promise.all([
    supabase.from('bookings').select('*').order('booking_date', { ascending: true }),
    supabase.from('payments').select('booking_id, amount'),
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

export function useBookings() {
  const [bookings, setBookings] = useState<BookingWithTotals[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchBookingsWithTotals();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const checkAvailability = useCallback(
    async (date: string, slot: BookingSlot, excludeBookingId?: string): Promise<boolean> => {
      let query = supabase
        .from('bookings')
        .select('id')
        .eq('booking_date', date)
        .eq('booking_slot', slot)
        .neq('status', 'cancelled');

      if (excludeBookingId) query = query.neq('id', excludeBookingId);

      const { data, error: checkError } = await query;
      if (checkError) throw checkError;
      return (data ?? []).length === 0;
    },
    [],
  );

  const createBooking = useCallback(
    async (input: {
      customer_name: string;
      phone: string;
      booking_date: string;
      booking_slot: BookingSlot;
      budget: number;
      advance: number;
    }): Promise<{ ok: true; booking: Booking } | { ok: false; reason: 'slot_taken' | 'error'; message?: string }> => {
      const available = await checkAvailability(input.booking_date, input.booking_slot);
      if (!available) return { ok: false, reason: 'slot_taken' };

      const { data: booking, error: insertError } = await supabase
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
        // Race: someone else took the slot between check and insert (unique index catches this too).
        if (insertError?.code === '23505') return { ok: false, reason: 'slot_taken' };
        return { ok: false, reason: 'error', message: insertError?.message };
      }

      if (input.advance > 0) {
        const { error: paymentError } = await supabase.from('payments').insert({
          booking_id: booking.id,
          amount: input.advance,
          payment_type: 'advance',
          notes: null,
        });
        if (paymentError) return { ok: false, reason: 'error', message: paymentError.message };
      }

      await refetch();
      return { ok: true, booking };
    },
    [checkAvailability, refetch],
  );

  const cancelBooking = useCallback(
    async (id: string) => {
      const { error: cancelError } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
      if (cancelError) throw cancelError;
      await refetch();
    },
    [refetch],
  );

  const bookingsWithStatus = bookings.map((b) => ({ ...b, status: getBookingStatus(b) as Booking['status'] }));

  return { bookings: bookingsWithStatus, loading, error, refetch, checkAvailability, createBooking, cancelBooking };
}
