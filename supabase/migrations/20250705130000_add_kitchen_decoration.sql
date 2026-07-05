-- Kitchen, decoration, and total booking value fields

do $$ begin
  create type decoration_type as enum ('in_house', 'outside', 'not_required');
exception
  when duplicate_object then null;
end $$;

alter table bookings
  add column if not exists kitchen_required boolean not null default false,
  add column if not exists kitchen_amount numeric(12, 2) not null default 0,
  add column if not exists decoration_type decoration_type not null default 'not_required',
  add column if not exists decorator_vendor text,
  add column if not exists decoration_amount numeric(12, 2) not null default 0,
  add column if not exists royalty_fee numeric(12, 2) not null default 0,
  add column if not exists total_booking_value numeric(12, 2) not null default 0;

alter table bookings drop constraint if exists bookings_kitchen_amount_check;
alter table bookings add constraint bookings_kitchen_amount_check check (kitchen_amount >= 0);

alter table bookings drop constraint if exists bookings_decoration_amount_check;
alter table bookings add constraint bookings_decoration_amount_check check (decoration_amount >= 0);

alter table bookings drop constraint if exists bookings_royalty_fee_check;
alter table bookings add constraint bookings_royalty_fee_check check (royalty_fee >= 0);

alter table bookings drop constraint if exists bookings_total_booking_value_check;
alter table bookings add constraint bookings_total_booking_value_check check (total_booking_value >= 0);

update bookings
set total_booking_value = budget
where total_booking_value = 0;

create or replace view booking_totals as
select
  b.id as booking_id,
  coalesce(sum(p.amount), 0)::numeric(12, 2) as collected,
  (b.total_booking_value - coalesce(sum(p.amount), 0))::numeric(12, 2) as pending
from bookings b
left join payments p on p.booking_id = b.id
group by b.id, b.total_booking_value;
