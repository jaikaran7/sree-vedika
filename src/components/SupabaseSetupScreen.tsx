export function SupabaseSetupScreen({ message }: { message?: string | null }) {
  const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-300">
        Sree Vedika Convention Hall
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink dark:text-ink-dark">Setup required</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-ink-dark-soft">
        {message ?? 'Supabase environment variables are missing or invalid, so the app cannot load bookings data.'}
      </p>

      <div className="mt-6 space-y-3 rounded-2xl border border-line bg-paper/80 p-4 text-sm dark:border-line-dark dark:bg-surface-dark/80">
        <p className="font-semibold text-ink dark:text-ink-dark">Correct format:</p>
        <ul className="space-y-2 font-mono text-xs text-ink-soft dark:text-ink-dark-soft">
          <li>
            <span className="text-ink dark:text-ink-dark">VITE_SUPABASE_URL</span>
            <br />
            https://your-project-ref.supabase.co
          </li>
          <li>
            <span className="text-ink dark:text-ink-dark">VITE_SUPABASE_ANON_KEY</span>
            <br />
            sb_publishable_… (not sb_secret_…)
          </li>
        </ul>
      </div>

      {isVercel ? (
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-ink-soft dark:text-ink-dark-soft">
          <li>Open your project in the Vercel dashboard</li>
          <li>Go to Settings → Environment Variables</li>
          <li>Set URL and publishable key from Supabase → Project Settings → API</li>
          <li>Redeploy the project</li>
        </ol>
      ) : (
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-ink-soft dark:text-ink-dark-soft">
          <li>Open Supabase → Project Settings → API</li>
          <li>Copy <strong>Project URL</strong> into <code className="rounded bg-ink/5 px-1 dark:bg-white/10">VITE_SUPABASE_URL</code></li>
          <li>Copy <strong>publishable key</strong> into <code className="rounded bg-ink/5 px-1 dark:bg-white/10">VITE_SUPABASE_ANON_KEY</code></li>
          <li>Restart <code className="rounded bg-ink/5 px-1 dark:bg-white/10">npm run dev</code></li>
        </ol>
      )}
    </div>
  );
}
