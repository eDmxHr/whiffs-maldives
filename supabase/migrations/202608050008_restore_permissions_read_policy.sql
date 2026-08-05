-- 202608050006's cleanup wrongly assumed every table with a redundant-looking
-- "roles.manage can read X" policy also had a "for all" policy covering it.
-- `permissions` never had one -- it has no admin-write policy at all, only
-- ever a read policy -- so dropping it left the table completely unreadable.
create policy "roles.manage can read permissions" on public.permissions for select
  using (public.has_permission('roles.manage'));
