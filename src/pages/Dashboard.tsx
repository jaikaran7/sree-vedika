import { useMemo, useState } from 'react';
import { useBookings } from '../hooks/useBookings';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { StatCard } from '../components/ui/StatCard';
import { SearchBar } from '../components/booking/SearchBar';
import { BookingCard } from '../components/booking/BookingCard';
import { PullToRefresh } from '../components/ui/PullToRefresh';
import { formatCurrency } from '../lib/format';

export default function Dashboard() {
  const { bookings, loading, error, refetch } = useBookings();
  const stats = useDashboardStats(bookings);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? bookings.filter(
          (b) =>
            b.customer_name.toLowerCase().includes(q) ||
            b.phone.includes(q) ||
            b.booking_date.includes(q),
        )
      : bookings;
    return [...list].sort((a, b) => (a.booking_date < b.booking_date ? 1 : -1));
  }, [bookings, query]);

  return (
    <PullToRefresh onRefresh={refetch}>
      <div className="mx-auto max-w-2xl px-4 pb-28 pt-5">
        <header className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300">
            Sree Vedika Convention Hall
          </p>
          <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">Dashboard</h1>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Today" value={stats.todayCount} />
          <StatCard label="Upcoming" value={stats.upcomingCount} />
          <StatCard label="Total Bookings" value={stats.totalCount} />
          <StatCard label="Pending" value={formatCurrency(stats.totalPending)} accent="maroon" />
        </div>
        <div className="mt-3">
          <StatCard label="Total Collected" value={formatCurrency(stats.totalCollected)} accent="gold" />
        </div>

        <div className="mt-6">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        <div className="mt-5 space-y-3">
          {loading && <p className="py-10 text-center text-sm text-ink-soft dark:text-ink-dark-soft">Loading bookings…</p>}
          {error && <p className="py-10 text-center text-sm text-maroon-500">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="py-16 text-center text-sm text-ink-soft dark:text-ink-dark-soft">
              {query ? 'No bookings match your search.' : 'No bookings yet. Tap + to create one.'}
            </p>
          )}
          {filtered.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      </div>
    </PullToRefresh>
  );
}
