-- Inquiry (lead management) tables

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
