# Sree Vedika Convention Hall

Mobile-first booking and payment manager for Sree Vedika Convention Hall. Built with React, Vite, Tailwind CSS, and Supabase.

## Features

- Dashboard with booking stats and search
- Calendar view with day-by-day bookings
- Create bookings with slot availability checks
- Payment history with add/edit
- PDF quotation and invoice generation (numbers persisted in Supabase)
- PWA installable on mobile

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase environment variables

Copy `.env.example` to `.env.local` and fill in your project values from [Supabase Dashboard](https://supabase.com/dashboard) → **Project Settings** → **API**:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Run database migrations

In your Supabase project, open **SQL Editor** → **New query**, then run **one** of:

**Option A — single file (easiest):** paste the full contents of `supabase/schema.sql` and click **Run**.

**Option B — step by step:** run each file in `supabase/migrations/` in numeric order:

| File | Creates |
|------|---------|
| `20250705120000_enable_extensions.sql` | `pgcrypto` extension |
| `20250705120001_create_bookings.sql` | `bookings` table, indexes, `updated_at` trigger |
| `20250705120002_create_payments.sql` | `payments` table, `booking_totals` view |
| `20250705120003_create_invoices.sql` | `invoices`, `invoice_counters`, `next_invoice_number()` |
| `20250705120004_create_quotations.sql` | `quotations`, `quotation_counters`, `next_quotation_number()` |
| `20250705120005_enable_rls.sql` | Row Level Security policies |

### 4. Start the dev server

```bash
npm run dev
```

Open the local URL shown in the terminal. Use the **Network** URL to test on your phone (same Wi‑Fi).

## Database schema

| Table | Purpose |
|-------|---------|
| `bookings` | Customer bookings with date, slot, budget, status |
| `payments` | Payment history linked to bookings |
| `invoices` | Issued invoice numbers (one per booking) |
| `quotations` | Issued quotation numbers with validity date |

All tables have primary keys, foreign keys, indexes, timestamps, and check constraints. RLS is enabled with permissive anon policies (personal-use app with no login screen).

## Project structure

```
src/
  lib/
    api/          # Supabase CRUD operations (bookings, payments, invoices, quotations)
    supabase.ts   # Supabase client
  hooks/          # React hooks wrapping the API layer
  pages/          # Dashboard, Calendar, Booking details, New booking
  components/     # UI, forms, PDF templates
supabase/
  migrations/     # Ordered SQL migration files
  schema.sql      # Full schema rollup for SQL Editor
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run Oxlint |

## Security note

This app uses the public anon key with open RLS policies because there is no authentication layer. Keep your Supabase URL and anon key private. Add Supabase Auth and tighten RLS policies before exposing the app publicly.
