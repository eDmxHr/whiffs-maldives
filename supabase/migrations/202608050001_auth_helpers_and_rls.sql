-- Helper functions
create or replace function public.is_authenticated()
returns boolean language sql stable security definer set search_path = public as $$
  select auth.uid() is not null;
$$;

create or replace function public.has_role(role_name text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid() and r.name = role_name
  );
$$;

create or replace function public.has_permission(permission_key text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions perm on perm.id = rp.permission_id
    where ur.user_id = auth.uid() and perm.key = permission_key
  );
$$;

grant execute on function public.is_authenticated() to authenticated, anon;
grant execute on function public.has_role(text) to authenticated, anon;
grant execute on function public.has_permission(text) to authenticated, anon;

-- Single-call profile+role+permissions context, used by getCurrentProfile()
create or replace function public.get_my_context()
returns table (id uuid, name text, avatar_url text, is_active boolean, role_name text, permissions text[])
language sql stable security definer set search_path = public as $$
  select p.id, p.name, p.avatar_url, p.is_active, r.name,
         coalesce(array_agg(distinct perm.key) filter (where perm.key is not null), '{}')
  from public.profiles p
  left join public.user_roles ur on ur.user_id = p.id
  left join public.roles r on r.id = ur.role_id
  left join public.role_permissions rp on rp.role_id = r.id
  left join public.permissions perm on perm.id = rp.permission_id
  where p.id = auth.uid()
  group by p.id, p.name, p.avatar_url, p.is_active, r.name;
$$;

grant execute on function public.get_my_context() to authenticated;

-- New-user trigger: auto-create a profile row for every auth.users insert
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Generic updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.brands for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.fragrances for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.offerings for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.suppliers for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.bottles for each row execute function public.set_updated_at();

-- profiles RLS
create policy "Users can read own profile" on public.profiles for select using (id = auth.uid());
create policy "Users with users.manage can read all profiles" on public.profiles for select using (public.has_permission('users.manage'));
create policy "Users can update own profile" on public.profiles for update using (id = auth.uid());

-- roles/permissions/user_roles/role_permissions RLS (get_my_context() bypasses this via security definer)
create policy "roles.manage can read roles" on public.roles for select using (public.has_permission('roles.manage'));
create policy "roles.manage can manage roles" on public.roles for all using (public.has_permission('roles.manage')) with check (public.has_permission('roles.manage'));
create policy "roles.manage can read permissions" on public.permissions for select using (public.has_permission('roles.manage'));
create policy "roles.manage can read user_roles" on public.user_roles for select using (public.has_permission('roles.manage') or user_id = auth.uid());
create policy "roles.manage can manage user_roles" on public.user_roles for all using (public.has_permission('roles.manage')) with check (public.has_permission('roles.manage'));
create policy "roles.manage can read role_permissions" on public.role_permissions for select using (public.has_permission('roles.manage'));
create policy "roles.manage can manage role_permissions" on public.role_permissions for all using (public.has_permission('roles.manage')) with check (public.has_permission('roles.manage'));

-- Catalog: authenticated admin visibility (full rows, not just published/active) + manage
create policy "catalog.view can read all brands" on public.brands for select using (public.has_permission('catalog.view'));
create policy "catalog.manage can write brands" on public.brands for all using (public.has_permission('catalog.manage')) with check (public.has_permission('catalog.manage'));

create policy "catalog.view can read all fragrances" on public.fragrances for select using (public.has_permission('catalog.view'));
create policy "catalog.manage can write fragrances" on public.fragrances for all using (public.has_permission('catalog.manage')) with check (public.has_permission('catalog.manage'));

create policy "catalog.view can read all fragrance_images" on public.fragrance_images for select using (public.has_permission('catalog.view'));
create policy "catalog.manage can write fragrance_images" on public.fragrance_images for all using (public.has_permission('catalog.manage')) with check (public.has_permission('catalog.manage'));

create policy "catalog.view can read notes" on public.notes for select using (public.has_permission('catalog.view'));
create policy "catalog.manage can write notes" on public.notes for all using (public.has_permission('catalog.manage')) with check (public.has_permission('catalog.manage'));
create policy "catalog.view can read fragrance_notes" on public.fragrance_notes for select using (public.has_permission('catalog.view'));
create policy "catalog.manage can write fragrance_notes" on public.fragrance_notes for all using (public.has_permission('catalog.manage')) with check (public.has_permission('catalog.manage'));

create policy "catalog.view can read all offerings" on public.offerings for select using (public.has_permission('catalog.view'));
create policy "catalog.manage can write offerings" on public.offerings for all using (public.has_permission('catalog.manage')) with check (public.has_permission('catalog.manage'));

-- Inventory (fully admin-only, no public policy needed)
create policy "inventory.view can read suppliers" on public.suppliers for select using (public.has_permission('inventory.view'));
create policy "inventory.create can insert suppliers" on public.suppliers for insert with check (public.has_permission('inventory.create'));
create policy "inventory.adjust can update suppliers" on public.suppliers for update using (public.has_permission('inventory.adjust')) with check (public.has_permission('inventory.adjust'));

create policy "inventory.view can read bottles" on public.bottles for select using (public.has_permission('inventory.view'));
create policy "inventory.create can insert bottles" on public.bottles for insert with check (public.has_permission('inventory.create'));
create policy "inventory.adjust can update bottles" on public.bottles for update using (public.has_permission('inventory.adjust')) with check (public.has_permission('inventory.adjust'));

create policy "inventory.view can read inventory_events" on public.inventory_events for select using (public.has_permission('inventory.view'));
create policy "inventory.create or adjust can insert inventory_events" on public.inventory_events for insert
  with check (public.has_permission('inventory.create') or public.has_permission('inventory.adjust'));
