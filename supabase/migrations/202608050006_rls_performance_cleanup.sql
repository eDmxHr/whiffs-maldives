-- Drop the redundant standalone SELECT policies on roles/permissions/user_roles/role_permissions:
-- the "for all" policies on the same tables already cover SELECT for the same condition.
drop policy if exists "roles.manage can read roles" on public.roles;
drop policy if exists "roles.manage can read permissions" on public.permissions;
drop policy if exists "roles.manage can read role_permissions" on public.role_permissions;

-- user_roles' select policy is NOT fully redundant (it also allows user_id = auth.uid()),
-- so keep it, but wrap auth.uid() so Postgres evaluates it once per statement, not per row.
drop policy if exists "roles.manage can read user_roles" on public.user_roles;
create policy "roles.manage can read user_roles" on public.user_roles for select
  using (public.has_permission('roles.manage') or user_id = (select auth.uid()));

-- profiles: same auth.uid() caching fix.
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select using (id = (select auth.uid()));

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (id = (select auth.uid()));
