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
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="surface-card flex h-11 w-11 items-center justify-center rounded-xl text-base text-ink-soft transition-[box-shadow,border-color] hover:border-gold-500/50 hover:text-ink dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark-soft dark:hover:border-gold-400/40 dark:hover:text-ink-dark"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
