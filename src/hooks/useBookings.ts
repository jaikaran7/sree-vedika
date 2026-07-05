import { useCallback, useEffect, useState } from 'react';
import {
  cancelBooking as cancelBookingApi,
  checkSlotAvailability,
  createBooking as createBookingApi,
  fetchAllBookingsWithTotals,
  toErrorMessage,
} from '../lib/api';
import { getBookingStatus } from '../lib/bookingStatus';
import type { Booking, BookingSlot } from '../lib/types';

export function useBookings() {
  const [bookings, setBookings] = useState<Awaited<ReturnType<typeof fetchAllBookingsWithTotals>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchAllBookingsWithTotals();
      setBookings(data);
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to load bookings'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createBooking = useCallback(
    async (input: Parameters<typeof createBookingApi>[0]) => {
      const result = await createBookingApi(input);
      if (result.ok) await refetch();
      return result;
    },
    [refetch],
  );

  const cancelBooking = useCallback(
    async (id: string) => {
      await cancelBookingApi(id);
      await refetch();
    },
    [refetch],
  );

  const bookingsWithStatus = bookings.map((b) => ({ ...b, status: getBookingStatus(b) as Booking['status'] }));

  return {
    bookings: bookingsWithStatus,
    loading,
    error,
    refetch,
    checkAvailability: checkSlotAvailability,
    createBooking,
    cancelBooking,
  };
}

export type { BookingSlot };
