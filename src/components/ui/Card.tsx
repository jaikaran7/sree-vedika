import type { HTMLAttributes } from 'react';

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl border border-line bg-white/80 backdrop-blur-sm shadow-[0_1px_2px_rgba(36,26,18,0.04)] dark:border-line-dark dark:bg-surface-dark/80 ${className}`}
      {...props}
    />
  );
}
