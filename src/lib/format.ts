export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string, opts: Intl.DateTimeFormatOptions = {}): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...opts });
}

export function formatDateLong(dateStr: string): string {
  return formatDate(dateStr, { weekday: 'long' });
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return phone;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function normalizePhoneForLink(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
}
