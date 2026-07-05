import { useCallback, useEffect, useState } from 'react';
import { cancelBooking as cancelBookingApi, fetchBookingWithTotals, toErrorMessage } from '../lib/api';
import { getBookingStatus } from '../lib/bookingStatus';
import type { Booking, BookingWithTotals } from '../lib/types';

export function useBooking(id: string | undefined) {
  const [booking, setBooking] = useState<BookingWithTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBookingWithTotals(id);
      if (!data) {
        setBooking(null);
        setError('Booking not found');
        return;
      }
      setBooking({ ...data, status: getBookingStatus(data) as Booking['status'] });
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to load booking'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const cancelBooking = useCallback(async () => {
    if (!id) return;
    await cancelBookingApi(id);
    await refetch();
  }, [id, refetch]);

  return { booking, loading, error, refetch, cancelBooking };
}
