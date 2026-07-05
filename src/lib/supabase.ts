import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function resolveSupabaseUrl(): string {
  const directUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
  if (directUrl && !directUrl.includes('YOUR_PROJECT') && !directUrl.includes('your-project')) {
    return directUrl;
  }

  const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_REF?.trim() ?? '';
  if (projectRef) {
    return `https://${projectRef}.supabase.co`;
  }

  return directUrl;
}

const url = resolveSupabaseUrl();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

function isValidSupabaseUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = Boolean(url && anonKey && isValidSupabaseUrl(url));

let client: SupabaseClient | null = null;

export function getSupabaseConfigError(): string | null {
  if (!anonKey) {
    return 'Set VITE_SUPABASE_ANON_KEY to your publishable key (sb_publishable_…).';
  }
  if (!url) {
    return 'Set VITE_SUPABASE_URL or VITE_SUPABASE_PROJECT_REF from Supabase → Project Settings → API.';
  }
  if (!isValidSupabaseUrl(url)) {
    return 'VITE_SUPABASE_URL must look like https://abcdefgh.supabase.co. Copy Project URL from Supabase → Project Settings → API (not an API key).';
  }
  if (anonKey.startsWith('sb_secret_')) {
    return 'Use the publishable key (sb_publishable_…) in VITE_SUPABASE_ANON_KEY. Never put secret keys in the browser.';
  }
  return null;
}

export function getSupabase(): SupabaseClient {
  const configError = getSupabaseConfigError();
  if (configError) {
    throw new Error(configError);
  }
  if (!client) {
    client = createClient(url, anonKey);
  }
  return client;
}
