-- Quotations: persist issued quotation numbers and validity window
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
