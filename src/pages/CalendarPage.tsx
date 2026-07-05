import { useMemo, useState } from 'react';
import { useBookings } from '../hooks/useBookings';
import { MonthCalendar } from '../components/calendar/MonthCalendar';
import { DayBookingsSheet } from '../components/calendar/DayBookingsSheet';
import { toISODate } from '../lib/format';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarPage() {
  const { bookings, loading } = useBookings();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(toISODate(now));

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, typeof bookings>();
    for (const b of bookings) {
      const list = map.get(b.booking_date) ?? [];
      list.push(b);
      map.set(b.booking_date, list);
    }
    return map;
  }, [bookings]);

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-5">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300">Calendar</p>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
            {MONTH_NAMES[month]} {year}
          </h1>
          <div className="flex gap-1">
            <button
              onClick={() => changeMonth(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5 dark:text-ink-dark-soft dark:hover:bg-white/10"
              aria-label="Previous month"
            >
              ‹
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5 dark:text-ink-dark-soft dark:hover:bg-white/10"
              aria-label="Next month"
            >
              ›
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <p className="py-10 text-center text-sm text-ink-soft dark:text-ink-dark-soft">Loading…</p>
      ) : (
        <>
          <MonthCalendar
            year={year}
            month={month}
            bookingsByDate={bookingsByDate}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <div className="mt-5">
            <DayBookingsSheet date={selectedDate} bookings={bookingsByDate.get(selectedDate) ?? []} />
          </div>
        </>
      )}
    </div>
  );
}
