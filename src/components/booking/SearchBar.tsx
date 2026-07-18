interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search by name, phone or date…' }: SearchBarProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/60">🔍</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type="search"
        placeholder={placeholder}
        className="surface-card h-12 w-full rounded-xl pl-11 pr-4 text-[15px] text-ink outline-none transition-[border-color,box-shadow] focus:border-maroon-500 focus:ring-2 focus:ring-maroon-500/12 dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark dark:focus:border-gold-400 dark:focus:ring-gold-400/15"
      />
    </div>
  );
}
