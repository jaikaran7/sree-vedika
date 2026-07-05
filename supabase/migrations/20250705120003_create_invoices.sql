-- Invoices: persist issued invoice numbers so re-downloads do not reissue
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
