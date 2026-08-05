create type public.bottle_status as enum ('available', 'low_volume', 'empty', 'archived');
create type public.inventory_event_type as enum ('initial_stock', 'adjustment', 'reserved', 'fulfilled', 'returned');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  primary key (user_id, role_id)
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.fragrances (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id),
  name text not null,
  slug text not null unique,
  description text,
  concentration text,
  release_year integer,
  perfumer text,
  gender text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.fragrance_images (
  id uuid primary key default gen_random_uuid(),
  fragrance_id uuid not null references public.fragrances(id) on delete cascade,
  storage_path text not null,
  public_url text,
  position integer not null check (position > 0),
  created_at timestamptz not null default now(),
  unique (fragrance_id, position)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text,
  created_at timestamptz not null default now()
);

create table public.fragrance_notes (
  fragrance_id uuid not null references public.fragrances(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  pyramid_level text check (pyramid_level in ('top', 'heart', 'base')),
  position integer not null default 1,
  primary key (fragrance_id, note_id, pyramid_level)
);

create table public.offerings (
  id uuid primary key default gen_random_uuid(),
  fragrance_id uuid not null references public.fragrances(id) on delete cascade,
  name text not null,
  type text not null default 'decant',
  size_ml numeric(8, 2) not null,
  price numeric(10, 2) not null,
  suggested_price numeric(10, 2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fragrance_id, type, size_ml)
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bottles (
  id uuid primary key default gen_random_uuid(),
  fragrance_id uuid not null references public.fragrances(id),
  supplier_id uuid references public.suppliers(id),
  original_volume_ml numeric(8, 2) not null check (original_volume_ml > 0),
  usable_volume_ml numeric(8, 2) not null check (usable_volume_ml > 0),
  remaining_volume_ml numeric(8, 2) not null check (remaining_volume_ml >= 0),
  purchase_price numeric(10, 2) not null check (purchase_price >= 0),
  purchase_date date,
  received_at timestamptz not null default now(),
  status public.bottle_status not null default 'available',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (remaining_volume_ml <= usable_volume_ml),
  check (usable_volume_ml <= original_volume_ml)
);

create table public.inventory_events (
  id uuid primary key default gen_random_uuid(),
  bottle_id uuid not null references public.bottles(id) on delete cascade,
  type public.inventory_event_type not null,
  quantity_ml numeric(8, 2) not null,
  balance_after_ml numeric(8, 2) not null,
  reference_type text,
  reference_id uuid,
  reason text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index brands_active_idx on public.brands(is_active);
create index fragrances_brand_idx on public.fragrances(brand_id);
create index fragrances_status_idx on public.fragrances(status, is_active);
create index fragrance_images_position_idx on public.fragrance_images(fragrance_id, position);
create index offerings_fragrance_idx on public.offerings(fragrance_id, is_active);
create index bottles_fifo_idx on public.bottles(fragrance_id, status, received_at);
create index inventory_events_bottle_idx on public.inventory_events(bottle_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.brands enable row level security;
alter table public.fragrances enable row level security;
alter table public.fragrance_images enable row level security;
alter table public.notes enable row level security;
alter table public.fragrance_notes enable row level security;
alter table public.offerings enable row level security;
alter table public.suppliers enable row level security;
alter table public.bottles enable row level security;
alter table public.inventory_events enable row level security;

create policy "Public can read active brands"
  on public.brands for select
  using (is_active = true);

create policy "Public can read published fragrances"
  on public.fragrances for select
  using (is_active = true and status = 'published');

create policy "Public can read published fragrance images"
  on public.fragrance_images for select
  using (
    exists (
      select 1 from public.fragrances f
      where f.id = fragrance_id and f.is_active = true and f.status = 'published'
    )
  );

create policy "Public can read active published offerings"
  on public.offerings for select
  using (
    is_active = true
    and exists (
      select 1 from public.fragrances f
      where f.id = fragrance_id and f.is_active = true and f.status = 'published'
    )
  );
