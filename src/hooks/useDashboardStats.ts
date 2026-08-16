import { useMemo } from 'react';
import { todayISO } from '../lib/format';
import type { BookingWithTotals } from '../lib/types';

export function useDashboardStats(bookings: BookingWithTotals[]) {
  return useMemo(() => {
    const today = todayISO();
    const active = bookings.filter((b) => b.status !== 'cancelled');

    const todayBookings = active.filter((b) => b.booking_date === today);
    const upcomingBookings = active.filter((b) => b.status === 'upcoming');
    const totalPending = active.reduce((sum, b) => sum + Math.max(b.pending, 0), 0);
    const totalCollected = active.reduce((sum, b) => sum + b.collected, 0);
    const totalCash = active.reduce((sum, b) => sum + (b.collectedCash ?? 0), 0);
    const totalOnline = active.reduce((sum, b) => sum + (b.collectedOnline ?? 0), 0);

    return {
      todayCount: todayBookings.length,
      upcomingCount: upcomingBookings.length,
      totalCount: active.length,
      totalPending,
      totalCollected,
      totalCash,
      totalOnline,
      todayBookings,
      upcomingBookings,
    };
  }, [bookings]);
}
