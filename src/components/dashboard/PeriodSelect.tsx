import { MONTH_OPTIONS, type DashboardPeriod } from '../../lib/dashboardPeriod';

const selectClass =
  'surface-card h-11 rounded-xl px-3 text-sm font-semibold text-ink outline-none transition-[border-color,box-shadow] focus:border-maroon-500 focus:ring-2 focus:ring-maroon-500/12 dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark dark:focus:border-gold-400 dark:focus:ring-gold-400/15';

type PeriodSelectProps = {
  period: DashboardPeriod;
  years: number[];
  onChange: (period: DashboardPeriod) => void;
};

export function PeriodSelect({ period, years, onChange }: PeriodSelectProps) {
  const yearValue = period.kind === 'all' ? 'all' : String(period.year);
  const monthValue = period.kind === 'month' ? String(period.month) : period.kind === 'year' ? 'year' : '';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Year"
        className={`${selectClass} min-w-[7.5rem]`}
        value={yearValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === 'all') {
            onChange({ kind: 'all' });
            return;
          }
          const year = Number(v);
          if (period.kind === 'month') onChange({ kind: 'month', year, month: period.month });
          else onChange({ kind: 'year', year });
        }}
      >
        <option value="all">All time</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      {period.kind !== 'all' && (
        <select
          aria-label="Month"
          className={`${selectClass} min-w-[9.5rem] flex-1`}
          value={monthValue}
          onChange={(e) => {
            const v = e.target.value;
            const year = period.year;
            if (v === 'year') onChange({ kind: 'year', year });
            else onChange({ kind: 'month', year, month: Number(v) });
          }}
        >
          <option value="year">Entire year</option>
          {MONTH_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
