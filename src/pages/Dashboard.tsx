import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';
import { useInquiries } from '../hooks/useInquiries';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useInquiryStats } from '../hooks/useInquiryStats';
import { StatCard } from '../components/ui/StatCard';
import { SearchBar } from '../components/booking/SearchBar';
import { BookingCard } from '../components/booking/BookingCard';
import { InquiryCard } from '../components/inquiry/InquiryCard';
import {
  InquiryFiltersBar,
  emptyInquiryFilters,
  filterInquiries,
  type InquiryFilters,
} from '../components/inquiry/InquiryFilters';
import { PeriodSelect } from '../components/dashboard/PeriodSelect';
import { PullToRefresh } from '../components/ui/PullToRefresh';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { formatCurrency } from '../lib/format';
import {
  availableYears,
  currentMonthPeriod,
  matchesPeriod,
  periodLabel,
  type DashboardPeriod,
} from '../lib/dashboardPeriod';

type DashboardSection = 'bookings' | 'inquiries';

function SectionTabs({ section, onChange }: { section: DashboardSection; onChange: (s: DashboardSection) => void }) {
  return (
    <div className="mb-5 flex rounded-2xl border border-line bg-maroon-50/40 p-1 shadow-[var(--shadow-card)] dark:border-line-dark dark:bg-surface-dark">
      {(['bookings', 'inquiries'] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
            section === tab
              ? 'bg-white text-maroon-500 shadow-sm dark:bg-maroon-500 dark:text-gold-300'
              : 'text-ink-soft hover:text-ink dark:text-ink-dark-soft dark:hover:text-ink-dark'
          }`}
        >
          {tab === 'bookings' ? 'Bookings' : 'Inquiries'}
        </button>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const section: DashboardSection = searchParams.get('section') === 'inquiries' ? 'inquiries' : 'bookings';

  const setSection = (s: DashboardSection) => {
    if (s === 'inquiries') setSearchParams({ section: 'inquiries' });
    else setSearchParams({});
  };

  const { bookings, loading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useBookings();
  const { inquiries, loading: inquiriesLoading, error: inquiriesError, refetch: refetchInquiries } = useInquiries();

  const [period, setPeriod] = useState<DashboardPeriod>(currentMonthPeriod);
  const [bookingQuery, setBookingQuery] = useState('');
  const [inquiryQuery, setInquiryQuery] = useState('');
  const [inquiryFilters, setInquiryFilters] = useState<InquiryFilters>(emptyInquiryFilters);
  const [showFilters, setShowFilters] = useState(false);

  const years = useMemo(
    () =>
      availableYears(
        bookings.map((b) => b.booking_date),
        inquiries.map((i) => i.created_at),
      ),
    [bookings, inquiries],
  );

  const periodBookings = useMemo(
    () => bookings.filter((b) => matchesPeriod(b.booking_date, period)),
    [bookings, period],
  );

  const periodInquiries = useMemo(
    () => inquiries.filter((i) => matchesPeriod(i.created_at, period)),
    [inquiries, period],
  );

  const bookingStats = useDashboardStats(periodBookings);
  const inquiryStats = useInquiryStats(periodInquiries);

  const filteredBookings = useMemo(() => {
    const q = bookingQuery.trim().toLowerCase();
    const list = q
      ? periodBookings.filter(
          (b) =>
            b.customer_name.toLowerCase().includes(q) ||
            b.phone.includes(q) ||
            b.booking_date.includes(q),
        )
      : periodBookings;
    return [...list].sort((a, b) => (a.booking_date < b.booking_date ? 1 : -1));
  }, [periodBookings, bookingQuery]);

  const filteredInquiries = useMemo(
    () => filterInquiries(periodInquiries, inquiryQuery, inquiryFilters),
    [periodInquiries, inquiryQuery, inquiryFilters],
  );

  const refetch = async () => {
    await Promise.all([refetchBookings(), refetchInquiries()]);
  };

  const rangeHint = periodLabel(period);

  return (
    <PullToRefresh onRefresh={refetch}>
      <div className="mx-auto max-w-2xl px-4 pb-28 pt-5">
        <header className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600 dark:text-gold-300">
            Sree Vedika Convention Hall
          </p>
          <h1 className="mt-1 font-display text-[1.75rem] font-semibold leading-tight text-ink dark:text-ink-dark">
            Dashboard
          </h1>
          <div className="mt-3 h-px w-12 bg-gradient-to-r from-gold-400 to-maroon-500/40" />
        </header>

        <div className="mb-4">
          <PeriodSelect period={period} years={years} onChange={setPeriod} />
          <p className="mt-2 text-xs text-ink-soft dark:text-ink-dark-soft">
            Showing {rangeHint}
            {section === 'bookings' ? ' · by booking date' : ' · by inquiry date'}
          </p>
        </div>

        <SectionTabs section={section} onChange={setSection} />

        {section === 'bookings' ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Today" value={bookingStats.todayCount} />
              <StatCard label="Upcoming" value={bookingStats.upcomingCount} />
              <StatCard label="Total Bookings" value={bookingStats.totalCount} />
              <StatCard label="Pending" value={formatCurrency(bookingStats.totalPending)} accent="maroon" />
            </div>
            <div className="mt-3">
              <div className="surface-card rounded-2xl border-l-[3px] border-l-gold-500 p-4 dark:border-line-dark dark:bg-surface-dark">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft/70">
                  Total Collected
                </p>
                <p className="mt-1.5 font-display text-2xl font-semibold leading-tight text-gold-600 dark:text-gold-300">
                  {formatCurrency(bookingStats.totalCollected)}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3 dark:border-line-dark">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft/70">
                      Cash
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold text-ink dark:text-ink-dark">
                      {formatCurrency(bookingStats.totalCash)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft/70">
                      Online
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold text-ink dark:text-ink-dark">
                      {formatCurrency(bookingStats.totalOnline)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <SearchBar value={bookingQuery} onChange={setBookingQuery} />
            </div>

            <div className="mt-5 space-y-3">
              {bookingsLoading && <LoadingState message="Loading bookings…" />}
              {bookingsError && <ErrorState message={bookingsError} onRetry={refetchBookings} />}
              {!bookingsLoading && !bookingsError && filteredBookings.length === 0 && (
                <p className="py-16 text-center text-sm text-ink-soft dark:text-ink-dark-soft">
                  {bookingQuery
                    ? 'No bookings match your search.'
                    : period.kind === 'all'
                      ? 'No bookings yet. Tap + to create one.'
                      : `No bookings in ${rangeHint}.`}
                </p>
              )}
              {filteredBookings.map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard label="Total Inquiries" value={inquiryStats.totalCount} />
              <StatCard label="Today's Follow-ups" value={inquiryStats.todayFollowUpCount} accent="maroon" />
              <StatCard label="New Inquiries" value={inquiryStats.newCount} />
              <StatCard label="Converted" value={inquiryStats.convertedCount} accent="gold" />
              <StatCard label="Lost" value={inquiryStats.lostCount} />
              <StatCard label="Pending Follow-ups" value={inquiryStats.pendingFollowUpCount} accent="maroon" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <StatCard label="Conversion Rate" value={`${inquiryStats.conversionRate}%`} accent="gold" />
              <StatCard label="Upcoming Follow-ups" value={inquiryStats.upcomingFollowUpCount} />
            </div>

            <div className="mt-6 space-y-3">
              <SearchBar
                value={inquiryQuery}
                onChange={setInquiryQuery}
                placeholder="Search by name, phone, date, status or source…"
              />
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className="text-sm font-semibold text-maroon-500 dark:text-gold-300"
              >
                {showFilters ? 'Hide filters' : 'Show filters'}
              </button>
              {showFilters && <InquiryFiltersBar filters={inquiryFilters} onChange={setInquiryFilters} />}
            </div>

            <div className="mt-5 space-y-3">
              {inquiriesLoading && <LoadingState message="Loading inquiries…" />}
              {inquiriesError && <ErrorState message={inquiriesError} onRetry={refetchInquiries} />}
              {!inquiriesLoading && !inquiriesError && filteredInquiries.length === 0 && (
                <p className="py-16 text-center text-sm text-ink-soft dark:text-ink-dark-soft">
                  {inquiryQuery || Object.values(inquiryFilters).some(Boolean)
                    ? 'No inquiries match your search or filters.'
                    : period.kind === 'all'
                      ? 'No inquiries yet. Tap + to create one.'
                      : `No inquiries in ${rangeHint}.`}
                </p>
              )}
              {filteredInquiries.map((i) => (
                <InquiryCard key={i.id} inquiry={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </PullToRefresh>
  );
}
