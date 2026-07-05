-- Payments: append-only payment history per booking
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

-- Derived totals view (never store redundantly on bookings)
create or replace view booking_totals as
select
  b.id as booking_id,
  coalesce(sum(p.amount), 0)::numeric(12, 2) as collected,
  (b.budget - coalesce(sum(p.amount), 0))::numeric(12, 2) as pending
from bookings b
left join payments p on p.booking_id = b.id
group by b.id, b.budget;
