import { useEffect, useState } from 'react';

function getInitialDark() {
  return document.documentElement.classList.contains('dark');
}

export function ThemeToggle() {
  const [dark, setDark] = useState(getInitialDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('sv-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle dark mode"
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-ink-soft transition-colors hover:border-gold-500/60 dark:border-line-dark dark:text-ink-dark-soft"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
