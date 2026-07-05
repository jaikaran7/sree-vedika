import type { Booking, BookingDisplayStatus, BookingSlot } from './types';

/** Slot cutoffs used only to decide whether "today" has finished for status display. */
const SLOT_END_HOUR: Record<BookingSlot, number> = {
  morning: 16, // afternoon handover
  evening: 23,
};

export function getBookingStatus(booking: Pick<Booking, 'status' | 'booking_date' | 'booking_slot'>): BookingDisplayStatus {
  if (booking.status === 'cancelled') return 'cancelled';

  const now = new Date();
  const [year, month, day] = booking.booking_date.split('-').map(Number);
  const bookingDate = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (bookingDate.getTime() > today.getTime()) return 'upcoming';

  if (bookingDate.getTime() === today.getTime()) {
    const hasSlotEnded = now.getHours() >= SLOT_END_HOUR[booking.booking_slot];
    return hasSlotEnded ? 'completed' : 'today';
  }

  return 'completed';
}
