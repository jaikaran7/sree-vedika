-- Row Level Security
-- This app uses only the public anon key with no login screen, so policies
-- grant the anon role full access. This is a personal-use tradeoff — do not
-- share the project URL/anon key publicly. Add auth and tighten policies if needed.

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
