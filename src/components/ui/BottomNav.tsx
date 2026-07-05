import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Dashboard', icon: '🏛️', end: true },
  { to: '/calendar', label: 'Calendar', icon: '📅', end: false },
];

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)] dark:border-line-dark dark:bg-surface-dark/90"
    >
      <div className="mx-auto flex max-w-2xl">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-colors ${
                isActive
                  ? 'text-maroon-500 dark:text-gold-300'
                  : 'text-ink-soft/70 dark:text-ink-dark-soft/70'
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
