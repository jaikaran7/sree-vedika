import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Dashboard', icon: '🏛️', end: true },
  { to: '/calendar', label: 'Calendar', icon: '📅', end: false },
];

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-nav)] backdrop-blur-md dark:border-line-dark dark:bg-surface-dark/95"
    >
      <div className="mx-auto flex max-w-2xl px-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative mx-1 my-1.5 flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-maroon-50 text-maroon-500 dark:bg-maroon-500/15 dark:text-gold-300'
                  : 'text-ink-soft hover:text-ink dark:text-ink-dark-soft/80 dark:hover:text-ink-dark'
              }`
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
