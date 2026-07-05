-- Bookings: core entity for convention hall reservations
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

-- Cancelled bookings do not block the same date+slot for a new booking
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
