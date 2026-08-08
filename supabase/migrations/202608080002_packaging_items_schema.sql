create table public.packaging_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null,
  unit_cost numeric(10, 2) not null check (unit_cost >= 0),
  quantity numeric(10, 2) not null default 0 check (quantity >= 0),
  minimum_quantity numeric(10, 2) not null default 0 check (minimum_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.packaging_items for each row execute function public.set_updated_at();

alter table public.packaging_items enable row level security;

create policy "packaging_items select" on public.packaging_items for select using (public.has_permission('packaging.view'));
create policy "packaging.manage can insert packaging_items" on public.packaging_items for insert with check (public.has_permission('packaging.manage'));
create policy "packaging.manage can update packaging_items" on public.packaging_items for update using (public.has_permission('packaging.manage')) with check (public.has_permission('packaging.manage'));
