import type { BookingDisplayStatus } from '../../lib/types';

const styles: Record<BookingDisplayStatus, string> = {
  today: 'bg-maroon-500 text-gold-300',
  upcoming: 'bg-gold-300/30 text-gold-600 dark:bg-gold-400/15 dark:text-gold-300',
  completed: 'bg-ink/8 text-ink-soft dark:bg-white/10 dark:text-ink-dark-soft',
  cancelled: 'bg-ink/5 text-ink-soft/70 line-through dark:bg-white/5 dark:text-ink-dark-soft/60',
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
