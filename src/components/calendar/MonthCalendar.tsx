import { toISODate } from '../../lib/format';
import type { BookingWithTotals } from '../../lib/types';

interface MonthCalendarProps {
  year: number;
  month: number; // 0-indexed
  bookingsByDate: Map<string, BookingWithTotals[]>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function MonthCalendar({ year, month, bookingsByDate, selectedDate, onSelectDate }: MonthCalendarProps) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayISOStr = toISODate(new Date());

  const cells: (string | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISODate(new Date(year, month, i + 1))),
  ];

  return (
    <div className="surface-card rounded-2xl p-4 dark:border-line-dark dark:bg-surface-dark">
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-ink-soft dark:text-ink-dark-soft/70">
        {WEEKDAYS.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const active = bookingsByDate.get(date)?.filter((b) => b.status !== 'cancelled') ?? [];
          const hasMorning = active.some((b) => b.booking_slot === 'morning');
          const hasEvening = active.some((b) => b.booking_slot === 'evening');
          const isToday = date === todayISOStr;
          const isSelected = date === selectedDate;
          const dayNum = Number(date.split('-')[2]);

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors ${
                isSelected
                  ? 'bg-maroon-500 text-gold-300 font-semibold shadow-sm shadow-maroon-500/25'
                  : isToday
                    ? 'bg-gold-300/30 text-ink font-semibold ring-1 ring-gold-400/30 dark:bg-gold-400/15 dark:text-ink-dark dark:ring-0'
                    : 'text-ink hover:bg-maroon-50 dark:text-ink-dark dark:hover:bg-white/10'
              }`}
            >
              {dayNum}
              {(hasMorning || hasEvening) && (
                <span className="absolute bottom-1.5 flex gap-0.5">
                  {hasMorning && (
                    <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-gold-300' : 'bg-gold-500'}`} />
                  )}
                  {hasEvening && (
                    <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-gold-300' : 'bg-maroon-500'}`} />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
