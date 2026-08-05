-- Consolidates each table's overlapping permissive policies (public-read + catalog.view +
-- catalog.manage's "for all") down to one SELECT policy and separate write policies, so
-- Postgres evaluates one condition per row instead of two or three. Also fixes a real gap:
-- `notes` and `fragrance_notes` never had a public read policy at all, so anonymous
-- storefront visitors got an empty notes/pyramid section on published fragrances.

-- brands
drop policy if exists "Public can read active brands" on public.brands;
drop policy if exists "catalog.view can read all brands" on public.brands;
drop policy if exists "catalog.manage can write brands" on public.brands;

create policy "brands select" on public.brands for select
  using (is_active = true or public.has_permission('catalog.view'));
create policy "catalog.manage can insert brands" on public.brands for insert
  with check (public.has_permission('catalog.manage'));
create policy "catalog.manage can update brands" on public.brands for update
  using (public.has_permission('catalog.manage')) with check (public.has_permission('catalog.manage'));
create policy "catalog.manage can delete brands" on public.brands for delete
  using (public.has_permission('catalog.manage'));

-- fragrances
drop policy if exists "Public can read published fragrances" on public.fragrances;
drop policy if exists "catalog.view can read all fragrances" on public.fragrances;
drop policy if exists "catalog.manage can write fragrances" on public.fragrances;

create policy "fragrances select" on public.fragrances for select
  using ((is_active = true and status = 'published') or public.has_permission('catalog.view'));
create policy "catalog.manage can insert fragrances" on public.fragrances for insert
  with check (public.has_permission('catalog.manage'));
create policy "catalog.manage can update fragrances" on public.fragrances for update
  using (public.has_permission('catalog.manage')) with check (public.has_permission('catalog.manage'));
create policy "catalog.manage can delete fragrances" on public.fragrances for delete
  using (public.has_permission('catalog.manage'));

-- fragrance_images
drop policy if exists "Public can read published fragrance images" on public.fragrance_images;
drop policy if exists "catalog.view can read all fragrance_images" on public.fragrance_images;
drop policy if exists "catalog.manage can write fragrance_images" on public.fragrance_images;

create policy "fragrance_images select" on public.fragrance_images for select
  using (
    exists (select 1 from public.fragrances f where f.id = fragrance_id and f.is_active = true and f.status = 'published')
    or public.has_permission('catalog.view')
  );
create policy "catalog.manage can insert fragrance_images" on public.fragrance_images for insert
  with check (public.has_permission('catalog.manage'));
create policy "catalog.manage can update fragrance_images" on public.fragrance_images for update
  using (public.has_permission('catalog.manage')) with check (public.has_permission('catalog.manage'));
create policy "catalog.manage can delete fragrance_images" on public.fragrance_images for delete
  using (public.has_permission('catalog.manage'));

-- notes: shared vocabulary (Bergamot, Lavender, etc.), not sensitive -- publicly readable outright.
drop policy if exists "catalog.view can read notes" on public.notes;
drop policy if exists "catalog.manage can write notes" on public.notes;

create policy "notes select" on public.notes for select using (true);
create policy "catalog.manage can insert notes" on public.notes for insert
  with check (public.has_permission('catalog.manage'));
create policy "catalog.manage can update notes" on public.notes for update
  using (public.has_permission('catalog.manage')) with check (public.has_permission('catalog.manage'));
create policy "catalog.manage can delete notes" on public.notes for delete
  using (public.has_permission('catalog.manage'));

-- fragrance_notes: the fragrance <-> note link, scoped like fragrance_images.
drop policy if exists "catalog.view can read fragrance_notes" on public.fragrance_notes;
drop policy if exists "catalog.manage can write fragrance_notes" on public.fragrance_notes;

create policy "fragrance_notes select" on public.fragrance_notes for select
  using (
    exists (select 1 from public.fragrances f where f.id = fragrance_id and f.is_active = true and f.status = 'published')
    or public.has_permission('catalog.view')
  );
create policy "catalog.manage can insert fragrance_notes" on public.fragrance_notes for insert
  with check (public.has_permission('catalog.manage'));
create policy "catalog.manage can update fragrance_notes" on public.fragrance_notes for update
  using (public.has_permission('catalog.manage')) with check (public.has_permission('catalog.manage'));
create policy "catalog.manage can delete fragrance_notes" on public.fragrance_notes for delete
  using (public.has_permission('catalog.manage'));

-- offerings
drop policy if exists "Public can read active published offerings" on public.offerings;
drop policy if exists "catalog.view can read all offerings" on public.offerings;
drop policy if exists "catalog.manage can write offerings" on public.offerings;

create policy "offerings select" on public.offerings for select
  using (
    (is_active = true and exists (
      select 1 from public.fragrances f where f.id = fragrance_id and f.is_active = true and f.status = 'published'
    ))
    or public.has_permission('catalog.view')
  );
create policy "catalog.manage can insert offerings" on public.offerings for insert
  with check (public.has_permission('catalog.manage'));
create policy "catalog.manage can update offerings" on public.offerings for update
  using (public.has_permission('catalog.manage')) with check (public.has_permission('catalog.manage'));
create policy "catalog.manage can delete offerings" on public.offerings for delete
  using (public.has_permission('catalog.manage'));

-- profiles: merge the two SELECT policies into one.
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users with users.manage can read all profiles" on public.profiles;

create policy "profiles select" on public.profiles for select
  using (id = (select auth.uid()) or public.has_permission('users.manage'));

-- user_roles: drop the "for all" (it duplicated the select policy's coverage), split into
-- explicit write policies, keep the one select policy that already has the self-read clause.
drop policy if exists "roles.manage can manage user_roles" on public.user_roles;

create policy "roles.manage can insert user_roles" on public.user_roles for insert
  with check (public.has_permission('roles.manage'));
create policy "roles.manage can update user_roles" on public.user_roles for update
  using (public.has_permission('roles.manage')) with check (public.has_permission('roles.manage'));
create policy "roles.manage can delete user_roles" on public.user_roles for delete
  using (public.has_permission('roles.manage'));
