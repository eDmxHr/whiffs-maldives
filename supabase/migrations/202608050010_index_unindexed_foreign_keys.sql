create index bottles_supplier_idx on public.bottles(supplier_id);
create index fragrance_notes_note_idx on public.fragrance_notes(note_id);
create index inventory_events_created_by_idx on public.inventory_events(created_by);
create index role_permissions_permission_idx on public.role_permissions(permission_id);
create index settings_updated_by_idx on public.settings(updated_by);
create index user_roles_role_idx on public.user_roles(role_id);
