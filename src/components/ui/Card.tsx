import type { HTMLAttributes } from 'react';

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`surface-card rounded-3xl bg-white dark:border-line-dark dark:bg-surface-dark/90 ${className}`}
      {...props}
    />
  );
}
