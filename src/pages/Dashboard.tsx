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
import { PullToRefresh } from '../components/ui/PullToRefresh';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { formatCurrency } from '../lib/format';

type DashboardSection = 'bookings' | 'inquiries';

function SectionTabs({ section, onChange }: { section: DashboardSection; onChange: (s: DashboardSection) => void }) {
  return (
    <div className="mb-5 flex rounded-xl border border-line bg-white p-1 dark:border-line-dark dark:bg-surface-dark">
      {(['bookings', 'inquiries'] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
            section === tab
              ? 'bg-maroon-500 text-gold-300 shadow-sm'
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
  const bookingStats = useDashboardStats(bookings);
  const inquiryStats = useInquiryStats(inquiries);

  const [bookingQuery, setBookingQuery] = useState('');
  const [inquiryQuery, setInquiryQuery] = useState('');
  const [inquiryFilters, setInquiryFilters] = useState<InquiryFilters>(emptyInquiryFilters);
  const [showFilters, setShowFilters] = useState(false);

  const filteredBookings = useMemo(() => {
    const q = bookingQuery.trim().toLowerCase();
    const list = q
      ? bookings.filter(
          (b) =>
            b.customer_name.toLowerCase().includes(q) ||
            b.phone.includes(q) ||
            b.booking_date.includes(q),
        )
      : bookings;
    return [...list].sort((a, b) => (a.booking_date < b.booking_date ? 1 : -1));
  }, [bookings, bookingQuery]);

  const filteredInquiries = useMemo(
    () => filterInquiries(inquiries, inquiryQuery, inquiryFilters),
    [inquiries, inquiryQuery, inquiryFilters],
  );

  const refetch = async () => {
    await Promise.all([refetchBookings(), refetchInquiries()]);
  };

  return (
    <PullToRefresh onRefresh={refetch}>
      <div className="mx-auto max-w-2xl px-4 pb-28 pt-5">
        <header className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300">
            Sree Vedika Convention Hall
          </p>
          <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">Dashboard</h1>
        </header>

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
              <StatCard label="Total Collected" value={formatCurrency(bookingStats.totalCollected)} accent="gold" />
            </div>

            <div className="mt-6">
              <SearchBar value={bookingQuery} onChange={setBookingQuery} />
            </div>

            <div className="mt-5 space-y-3">
              {bookingsLoading && <LoadingState message="Loading bookings…" />}
              {bookingsError && <ErrorState message={bookingsError} onRetry={refetchBookings} />}
              {!bookingsLoading && !bookingsError && filteredBookings.length === 0 && (
                <p className="py-16 text-center text-sm text-ink-soft dark:text-ink-dark-soft">
                  {bookingQuery ? 'No bookings match your search.' : 'No bookings yet. Tap + to create one.'}
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
              <StatCard label="This Month" value={inquiryStats.monthlyCount} />
            </div>
            <div className="mt-3">
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
                    : 'No inquiries yet. Tap + to create one.'}
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
