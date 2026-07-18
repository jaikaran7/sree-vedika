export type DashboardPeriod =
  | { kind: 'all' }
  | { kind: 'year'; year: number }
  | { kind: 'month'; year: number; month: number }; // month 1–12

export const MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
] as const;

export function currentMonthPeriod(): DashboardPeriod {
  const d = new Date();
  return { kind: 'month', year: d.getFullYear(), month: d.getMonth() + 1 };
}

/** Match YYYY-MM-DD or ISO datetime against the selected period. */
export function matchesPeriod(isoDate: string, period: DashboardPeriod): boolean {
  if (period.kind === 'all') return true;
  const y = Number(isoDate.slice(0, 4));
  const m = Number(isoDate.slice(5, 7));
  if (!y || !m) return false;
  if (period.kind === 'year') return y === period.year;
  return y === period.year && m === period.month;
}

export function periodLabel(period: DashboardPeriod): string {
  if (period.kind === 'all') return 'All time';
  if (period.kind === 'year') return String(period.year);
  const name = MONTH_OPTIONS.find((m) => m.value === period.month)?.label ?? '';
  return `${name} ${period.year}`;
}

/** Years to offer in the picker: data years ∪ current year, newest first. */
export function availableYears(...dateLists: string[][]): number[] {
  const years = new Set<number>([new Date().getFullYear()]);
  for (const list of dateLists) {
    for (const d of list) {
      const y = Number(d.slice(0, 4));
      if (y) years.add(y);
    }
  }
  return [...years].sort((a, b) => b - a);
}
