-- Orders, order items, fulfillment checklist, and customers -- replaces the in-memory
-- demo-store.ts fixtures that previously backed these domains.

create type public.order_status as enum
  ('pending_payment', 'payment_confirmed', 'preparing', 'ready', 'completed', 'cancelled');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null default '',
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.customers(id),
  status public.order_status not null default 'pending_payment',
  payment_status public.payment_status not null default 'pending',
  subtotal numeric(10, 2) not null default 0 check (subtotal >= 0),
  delivery_fee numeric(10, 2) not null default 0 check (delivery_fee >= 0),
  total numeric(10, 2) not null default 0 check (total >= 0),
  delivery_method text not null default '',
  delivery_address text not null default '',
  notes text not null default '',
  payment_proof_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  fragrance_id uuid not null references public.fragrances(id),
  offering_id uuid not null references public.offerings(id),
  size_ml numeric(8, 2) not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  total_price numeric(10, 2) not null check (total_price >= 0),
  fulfilled_quantity integer not null default 0 check (fulfilled_quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (fulfilled_quantity <= quantity)
);

-- id is a stable step key ('collect'|'fill'|'quality'|'package'), not a uuid -- matches the
-- fixed checklist steps the UI already renders (see defaultChecklist() in the old demo-store).
create table public.fulfillment_checklist_items (
  id text not null check (id in ('collect', 'fill', 'quality', 'package')),
  order_id uuid not null references public.orders(id) on delete cascade,
  label text not null,
  done boolean not null default false,
  position integer not null default 1,
  primary key (order_id, id)
);

create index orders_customer_idx on public.orders(customer_id);
create index orders_status_idx on public.orders(status);
create index order_items_order_idx on public.order_items(order_id);
create index order_items_fragrance_idx on public.order_items(fragrance_id);
create index order_items_offering_idx on public.order_items(offering_id);
create index fulfillment_checklist_items_order_idx on public.fulfillment_checklist_items(order_id);

create trigger set_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.order_items for each row execute function public.set_updated_at();

-- Derived customer aggregates, kept as a view rather than denormalized/trigger-maintained
-- columns on customers -- cheap to compute at this data volume, one source of truth.
create view public.customer_stats
with (security_invoker = true) as
select
  c.id as customer_id,
  count(o.id) as order_count,
  coalesce(sum(o.total), 0) as lifetime_value,
  case when count(o.id) > 0 then coalesce(sum(o.total), 0) / count(o.id) else 0 end as average_order_value
from public.customers c
left join public.orders o on o.customer_id = c.id
group by c.id;

alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.fulfillment_checklist_items enable row level security;

create policy "customers select" on public.customers for select using (public.has_permission('customers.view'));
create policy "customers.manage can insert customers" on public.customers for insert with check (public.has_permission('customers.manage'));
create policy "customers.manage can update customers" on public.customers for update using (public.has_permission('customers.manage')) with check (public.has_permission('customers.manage'));

create policy "orders select" on public.orders for select using (public.has_permission('orders.view'));
create policy "orders.create can insert orders" on public.orders for insert with check (public.has_permission('orders.create'));
create policy "orders.update can update orders" on public.orders for update using (public.has_permission('orders.update')) with check (public.has_permission('orders.update'));

create policy "order_items select" on public.order_items for select using (public.has_permission('orders.view'));
create policy "orders.create can insert order_items" on public.order_items for insert with check (public.has_permission('orders.create'));
create policy "orders.fulfill can update order_items" on public.order_items for update using (public.has_permission('orders.fulfill')) with check (public.has_permission('orders.fulfill'));

create policy "fulfillment_checklist_items select" on public.fulfillment_checklist_items for select using (public.has_permission('orders.view'));
create policy "orders.create can insert fulfillment_checklist_items" on public.fulfillment_checklist_items for insert with check (public.has_permission('orders.create'));
create policy "orders.fulfill can update fulfillment_checklist_items" on public.fulfillment_checklist_items for update using (public.has_permission('orders.fulfill')) with check (public.has_permission('orders.fulfill'));
