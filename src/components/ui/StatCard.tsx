export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: 'gold' | 'maroon';
}) {
  const accentBorder =
    accent === 'gold'
      ? 'border-l-gold-500'
      : accent === 'maroon'
        ? 'border-l-maroon-500'
        : 'border-l-transparent';

  return (
    <div
      className={`surface-card rounded-2xl border-l-[3px] p-4 dark:border-line-dark dark:bg-surface-dark ${accentBorder}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft/70">
        {label}
      </p>
      <p
        className={`mt-1.5 font-display text-2xl font-semibold leading-tight ${
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
