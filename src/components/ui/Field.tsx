import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const fieldBase =
  'surface-card w-full h-12 rounded-xl px-4 text-[15px] text-ink placeholder:text-ink-soft/70 outline-none transition-[border-color,box-shadow] focus:border-maroon-500 focus:ring-2 focus:ring-maroon-500/12 dark:bg-surface-dark dark:border-line-dark dark:text-ink-dark dark:focus:border-gold-400 dark:focus:ring-gold-400/15';

interface WrapperProps {
  label: string;
  error?: string;
  children?: ReactNode;
  hint?: string;
}

export function FieldWrapper({ label, error, children, hint }: WrapperProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold uppercase tracking-wide text-ink-soft dark:text-ink-dark-soft">
        {label}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-soft dark:text-ink-dark-soft">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-maroon-500 dark:text-maroon-400">{error}</span>}
    </label>
  );
}

export function TextInput({
  label,
  error,
  hint,
  className = '',
  ...props
}: WrapperProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      <input className={`${fieldBase} ${className}`} {...props} />
    </FieldWrapper>
  );
}

export function TextArea({
  label,
  error,
  hint,
  className = '',
  ...props
}: WrapperProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      <textarea className={`${fieldBase} h-24 py-3 resize-none ${className}`} {...props} />
    </FieldWrapper>
  );
}

export function SelectInput({
  label,
  error,
  hint,
  className = '',
  children,
  ...props
}: WrapperProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      <select className={`${fieldBase} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="%2371624f"><path d="M5.5 7.5l4.5 4.5 4.5-4.5" stroke="%2371624f" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>')] bg-no-repeat bg-[right_1rem_center] pr-10 ${className}`} {...props}>
        {children}
      </select>
    </FieldWrapper>
  );
}
