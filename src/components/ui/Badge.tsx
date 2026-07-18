import type { BookingDisplayStatus } from '../../lib/types';

const styles: Record<BookingDisplayStatus, string> = {
  today: 'bg-maroon-500 text-gold-300 shadow-sm shadow-maroon-500/20',
  upcoming: 'bg-gold-300/35 text-gold-600 ring-1 ring-gold-400/25 dark:bg-gold-400/15 dark:text-gold-300 dark:ring-0',
  completed: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  cancelled: 'bg-ink/4 text-ink-soft/80 line-through dark:bg-white/5 dark:text-ink-dark-soft/60',
};

const labels: Record<BookingDisplayStatus, string> = {
  today: 'Today',
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function StatusBadge({ status }: { status: BookingDisplayStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
