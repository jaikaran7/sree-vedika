-- Sree Vedika Convention Hall — full schema
-- Run this once in Supabase Dashboard → SQL Editor → New query.
-- Or run each file in supabase/migrations/ in numeric order.

-- 001 extensions
create extension if not exists "pgcrypto";

-- 002 decoration type enum
do $$ begin
  create type decoration_type as enum ('in_house', 'outside', 'not_required');
exception
  when duplicate_object then null;
end $$;

-- 003 bookings
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  booking_date date not null,
  booking_slot text not null check (booking_slot in ('morning', 'evening')),
  budget numeric(12, 2) not null check (budget >= 0),
  kitchen_required boolean not null default false,
  kitchen_amount numeric(12, 2) not null default 0 check (kitchen_amount >= 0),
  decoration_type decoration_type not null default 'not_required',
  decorator_vendor text,
  decoration_amount numeric(12, 2) not null default 0 check (decoration_amount >= 0),
  royalty_fee numeric(12, 2) not null default 0 check (royalty_fee >= 0),
  total_booking_value numeric(12, 2) not null default 0 check (total_booking_value >= 0),
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

-- 004 payments
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  payment_type text not null check (
    payment_type in ('advance', 'second_payment', 'final_payment', 'adjustment', 'other')
  ),
  notes text,
  payment_date date not null default current_date,
  payment_method text not null default 'cash' check (payment_method in ('cash', 'online')),
  created_at timestamptz not null default now()
);

create index if not exists payments_booking_id_idx on payments (booking_id);
create index if not exists payments_payment_date_idx on payments (payment_date);

create or replace view booking_totals as
select
  b.id as booking_id,
  coalesce(sum(p.amount), 0)::numeric(12, 2) as collected,
  (b.total_booking_value - coalesce(sum(p.amount), 0))::numeric(12, 2) as pending
from bookings b
left join payments p on p.booking_id = b.id
group by b.id, b.total_booking_value;

-- 005 invoices
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

-- 006 quotations
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

-- 007 RLS
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

-- 008 inquiries
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  alternate_phone text,
  event_type text not null check (event_type in (
    'wedding', 'reception', 'engagement', 'birthday', 'half_saree',
    'baby_shower', 'corporate_event', 'anniversary', 'naming_ceremony', 'other'
  )),
  expected_event_date date not null,
  preferred_slot text not null default 'flexible' check (preferred_slot in ('morning', 'evening', 'flexible')),
  expected_guests int check (expected_guests is null or expected_guests > 0),
  source text not null check (source in (
    'walk_in', 'phone_call', 'whatsapp', 'google', 'instagram', 'facebook',
    'reference', 'existing_customer', 'website', 'other'
  )),
  expected_budget numeric(12, 2) check (expected_budget is null or expected_budget >= 0),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'new_inquiry' check (status in (
    'new_inquiry', 'contacted', 'hall_visit_scheduled', 'hall_visited',
    'negotiation', 'waiting_for_confirmation', 'converted_to_booking', 'lost'
  )),
  notes text,
  next_followup_date date,
  booking_id uuid references bookings(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inquiries_phone_idx on inquiries (phone);
create index if not exists inquiries_status_idx on inquiries (status);
create index if not exists inquiries_source_idx on inquiries (source);
create index if not exists inquiries_priority_idx on inquiries (priority);
create index if not exists inquiries_event_date_idx on inquiries (expected_event_date);
create index if not exists inquiries_followup_date_idx on inquiries (next_followup_date);
create index if not exists inquiries_booking_id_idx on inquiries (booking_id);

drop trigger if exists inquiries_set_updated_at on inquiries;
create trigger inquiries_set_updated_at
  before update on inquiries
  for each row execute function set_updated_at();

create table if not exists followups (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references inquiries(id) on delete cascade,
  remarks text not null,
  followup_date date not null default current_date,
  followup_time time not null default current_time,
  next_followup_date date,
  status text not null check (status in (
    'new_inquiry', 'contacted', 'hall_visit_scheduled', 'hall_visited',
    'negotiation', 'waiting_for_confirmation', 'converted_to_booking', 'lost'
  )),
  created_at timestamptz not null default now()
);

create index if not exists followups_inquiry_id_idx on followups (inquiry_id);
create index if not exists followups_followup_date_idx on followups (followup_date);

alter table inquiries enable row level security;
alter table followups enable row level security;

drop policy if exists "anon full access" on inquiries;
create policy "anon full access" on inquiries for all to anon using (true) with check (true);

drop policy if exists "anon full access" on followups;
create policy "anon full access" on followups for all to anon using (true) with check (true);
