export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: 'gold' | 'maroon';
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 dark:border-line-dark dark:bg-surface-dark">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft/70 dark:text-ink-dark-soft/70">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-2xl font-semibold ${
          accent === 'gold'
            ? 'text-gold-600 dark:text-gold-300'
            : accent === 'maroon'
              ? 'text-maroon-500 dark:text-maroon-400'
              : 'text-ink dark:text-ink-dark'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
