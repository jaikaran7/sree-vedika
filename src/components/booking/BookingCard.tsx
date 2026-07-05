import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../ui/Badge';
import { formatCurrency, formatDate, formatPhone } from '../../lib/format';
import type { BookingWithTotals } from '../../lib/types';

export function BookingCard({ booking }: { booking: BookingWithTotals }) {
  const navigate = useNavigate();
  const slotLabel = booking.booking_slot === 'morning' ? 'Morning' : 'Evening';

  return (
    <button
      onClick={() => navigate(`/booking/${booking.id}`)}
      className="w-full rounded-2xl border border-line bg-white p-4 text-left transition-transform active:scale-[0.99] dark:border-line-dark dark:bg-surface-dark"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-semibold text-ink dark:text-ink-dark">{booking.customer_name}</p>
          <p className="mt-0.5 text-sm text-ink-soft dark:text-ink-dark-soft">{formatPhone(booking.phone)}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-ink-soft dark:text-ink-dark-soft">
        <span>{formatDate(booking.booking_date)}</span>
        <span className="text-line dark:text-line-dark">•</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-gold-300/25 px-2 py-0.5 text-xs font-semibold text-gold-600 dark:bg-gold-400/10 dark:text-gold-300">
          {slotLabel}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center dark:border-line-dark">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ink-soft/70 dark:text-ink-dark-soft/70">Total</p>
          <p className="text-sm font-semibold text-ink dark:text-ink-dark">{formatCurrency(booking.total_booking_value)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ink-soft/70 dark:text-ink-dark-soft/70">Collected</p>
          <p className="text-sm font-semibold text-maroon-500 dark:text-gold-300">{formatCurrency(booking.collected)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ink-soft/70 dark:text-ink-dark-soft/70">Pending</p>
          <p className={`text-sm font-semibold ${booking.pending > 0 ? 'text-maroon-600 dark:text-maroon-400' : 'text-ink-soft dark:text-ink-dark-soft'}`}>
            {formatCurrency(Math.max(booking.pending, 0))}
          </p>
        </div>
      </div>
    </button>
  );
}
