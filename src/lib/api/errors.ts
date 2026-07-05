import type { PostgrestError } from '@supabase/supabase-js';

export function toErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as PostgrestError).message);
  }
  return fallback;
}

export function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as PostgrestError).code === '23505';
}
