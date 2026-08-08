-- Assigns exactly one role to a user, atomically. profiles/roles/user_roles already exist
-- (202607300001_first_vertical_slice.sql, 202608050001_auth_helpers_and_rls.sql); this is the
-- only new function needed to replace the old demo-store.ts AdminUser role editing. user_roles
-- itself stays many-to-many for future flexibility -- "one role per user" is enforced here, at
-- the write boundary, matching how the app has always treated AdminUser.role as singular.
create or replace function public.set_user_role(p_user_id uuid, p_role_name text)
returns void
language plpgsql security invoker set search_path = public as $$
declare
  v_role_id uuid;
begin
  if not public.has_permission('users.manage') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  select id into v_role_id from public.roles where name = p_role_name;

  if v_role_id is null then
    raise exception 'VALIDATION_ERROR' using errcode = '22000';
  end if;

  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'NOT_FOUND' using errcode = 'P0002';
  end if;

  delete from public.user_roles where user_id = p_user_id;
  insert into public.user_roles (user_id, role_id) values (p_user_id, v_role_id);
end;
$$;

grant execute on function public.set_user_role(uuid, text) to authenticated;
