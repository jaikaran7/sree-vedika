import { useNavigate } from 'react-router-dom';
import { formatDateLong } from '../../lib/format';
import type { BookingWithTotals, BookingSlot } from '../../lib/types';

export function DayBookingsSheet({ date, bookings }: { date: string; bookings: BookingWithTotals[] }) {
  const navigate = useNavigate();
  const active = bookings.filter((b) => b.status !== 'cancelled');

  const slotInfo = (slot: BookingSlot) => active.find((b) => b.booking_slot === slot);

  return (
    <div className="rounded-2xl border border-line bg-white p-4 dark:border-line-dark dark:bg-surface-dark">
      <h3 className="font-display text-base font-semibold text-ink dark:text-ink-dark">{formatDateLong(date)}</h3>
      <div className="mt-3 space-y-2">
        {(['morning', 'evening'] as BookingSlot[]).map((slot) => {
          const booking = slotInfo(slot);
          return (
            <button
              key={slot}
              disabled={!booking}
              onClick={() => booking && navigate(`/booking/${booking.id}`)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm ${
                booking
                  ? 'border-maroon-500/30 bg-maroon-50 dark:border-maroon-400/30 dark:bg-maroon-500/10'
                  : 'border-line dark:border-line-dark'
              }`}
            >
              <span className="font-semibold capitalize text-ink dark:text-ink-dark">{slot}</span>
              {booking ? (
                <span className="text-maroon-500 dark:text-gold-300">{booking.customer_name}</span>
              ) : (
                <span className="text-ink-soft/70 dark:text-ink-dark-soft/70">Available</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
