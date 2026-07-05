-- Sree Vedika Convention Hall — full schema
-- Run this once in Supabase Dashboard → SQL Editor → New query.
-- Or run each file in supabase/migrations/ in numeric order.

-- 001 extensions
create extension if not exists "pgcrypto";

-- 002 bookings
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  booking_date date not null,
  booking_slot text not null check (booking_slot in ('morning', 'evening')),
  budget numeric(12, 2) not null check (budget >= 0),
  status text not null default 'upcoming' check (status in ('upcoming', 'today', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists bookings_date_slot_active_idx
  on bookings (booking_date, booking_slot)
  where status <> 'cancelled';

create index if not exists bookings_date_idx on bookings (booking_date);
create index if not exists bookings_status_idx on bookings (status);
create index if not exists bookings_phone_idx on bookings (phone);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on bookings;
create trigger bookings_set_updated_at
  before update on bookings
  for each row execute function set_updated_at();

-- 003 payments
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  payment_type text not null check (
    payment_type in ('advance', 'second_payment', 'final_payment', 'adjustment', 'other')
  ),
  notes text,
  payment_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists payments_booking_id_idx on payments (booking_id);
create index if not exists payments_payment_date_idx on payments (payment_date);

create or replace view booking_totals as
select
  b.id as booking_id,
  coalesce(sum(p.amount), 0)::numeric(12, 2) as collected,
  (b.budget - coalesce(sum(p.amount), 0))::numeric(12, 2) as pending
from bookings b
left join payments p on p.booking_id = b.id
group by b.id, b.budget;

-- 004 invoices
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  invoice_number text not null unique,
  created_at timestamptz not null default now()
);

create unique index if not exists invoices_booking_id_idx on invoices (booking_id);
create index if not exists invoices_created_at_idx on invoices (created_at);

create table if not exists invoice_counters (
  year int primary key,
  last_number int not null default 0
);

create or replace function next_invoice_number(p_year int)
returns text
language plpgsql
as $$
declare
  n int;
begin
  insert into invoice_counters (year, last_number)
  values (p_year, 1)
  on conflict (year) do update set last_number = invoice_counters.last_number + 1
  returning last_number into n;
  return 'SVCH-' || p_year || '-' || lpad(n::text, 4, '0');
end;
$$;

-- 005 quotations
create table if not exists quotations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  quotation_number text not null unique,
  valid_until date not null,
  created_at timestamptz not null default now()
);

create unique index if not exists quotations_booking_id_idx on quotations (booking_id);
create index if not exists quotations_valid_until_idx on quotations (valid_until);
create index if not exists quotations_created_at_idx on quotations (created_at);

create table if not exists quotation_counters (
  year int primary key,
  last_number int not null default 0
);

create or replace function next_quotation_number(p_year int)
returns text
language plpgsql
as $$
declare
  n int;
begin
  insert into quotation_counters (year, last_number)
  values (p_year, 1)
  on conflict (year) do update set last_number = quotation_counters.last_number + 1
  returning last_number into n;
  return 'SVCH-Q-' || p_year || '-' || lpad(n::text, 4, '0');
end;
$$;

-- 006 RLS
alter table bookings enable row level security;
alter table payments enable row level security;
alter table invoices enable row level security;
alter table invoice_counters enable row level security;
alter table quotations enable row level security;
alter table quotation_counters enable row level security;

drop policy if exists "anon full access" on bookings;
create policy "anon full access" on bookings for all to anon using (true) with check (true);

drop policy if exists "anon full access" on payments;
create policy "anon full access" on payments for all to anon using (true) with check (true);

drop policy if exists "anon full access" on invoices;
create policy "anon full access" on invoices for all to anon using (true) with check (true);

drop policy if exists "anon full access" on invoice_counters;
create policy "anon full access" on invoice_counters for all to anon using (true) with check (true);

drop policy if exists "anon full access" on quotations;
create policy "anon full access" on quotations for all to anon using (true) with check (true);

drop policy if exists "anon full access" on quotation_counters;
create policy "anon full access" on quotation_counters for all to anon using (true) with check (true);
