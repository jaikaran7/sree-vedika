import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getBookingStatus } from '../lib/bookingStatus';
import type { Booking, BookingWithTotals } from '../lib/types';

export function useBooking(id: string | undefined) {
  const [booking, setBooking] = useState<BookingWithTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const [{ data: b, error: bErr }, { data: payments, error: pErr }] = await Promise.all([
        supabase.from('bookings').select('*').eq('id', id).single(),
        supabase.from('payments').select('amount').eq('booking_id', id),
      ]);
      if (bErr) throw bErr;
      if (pErr) throw pErr;

      const collected = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
      const withStatus: BookingWithTotals = {
        ...(b as Booking),
        status: getBookingStatus(b as Booking) as Booking['status'],
        collected,
        pending: Number((b as Booking).budget) - collected,
      };
      setBooking(withStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const cancelBooking = useCallback(async () => {
    if (!id) return;
    const { error: cancelError } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
    if (cancelError) throw cancelError;
    await refetch();
  }, [id, refetch]);

  return { booking, loading, error, refetch, cancelBooking };
}
