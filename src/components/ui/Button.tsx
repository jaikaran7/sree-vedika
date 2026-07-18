import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg' | 'icon';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-maroon-500 text-gold-300 hover:bg-maroon-600 active:bg-maroon-700 shadow-sm shadow-maroon-500/25 dark:bg-maroon-500 dark:hover:bg-maroon-400',
  secondary:
    'surface-card bg-white text-ink hover:border-gold-500/50 hover:bg-gold-300/8 dark:bg-surface-dark dark:text-ink-dark dark:border-line-dark',
  ghost: 'bg-transparent text-ink-soft hover:bg-maroon-50 hover:text-ink dark:text-ink-dark-soft dark:hover:bg-white/5',
  danger: 'bg-maroon-600 text-gold-300 hover:bg-maroon-700 shadow-sm shadow-maroon-600/25',
};

const sizeClasses: Record<Size, string> = {
  md: 'h-11 px-4 text-sm rounded-xl gap-2',
  lg: 'h-13 px-6 text-base rounded-2xl gap-2 min-h-[3.25rem]',
  icon: 'h-11 w-11 rounded-xl',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold tracking-wide transition-colors disabled:opacity-40 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
