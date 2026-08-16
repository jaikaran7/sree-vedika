-- How payment was collected: cash or online
alter table payments
  add column if not exists payment_method text not null default 'cash'
  check (payment_method in ('cash', 'online'));

comment on column payments.payment_method is 'How the payment was collected: cash or online';
