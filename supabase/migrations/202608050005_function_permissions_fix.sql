-- Postgres grants EXECUTE to PUBLIC by default on CREATE FUNCTION; the earlier
-- explicit grants only added to that, they didn't restrict it. Revoke PUBLIC
-- first, then grant exactly what's intended.

revoke execute on function public.is_authenticated() from public;
revoke execute on function public.has_role(text) from public;
revoke execute on function public.has_permission(text) from public;
revoke execute on function public.get_my_context() from public;
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.set_updated_at() from public;
revoke execute on function public.create_bottle(uuid, uuid, numeric, numeric, numeric, date, text) from public;
revoke execute on function public.adjust_bottle_volume(uuid, numeric, text) from public;

grant execute on function public.is_authenticated() to authenticated, anon;
grant execute on function public.has_role(text) to authenticated, anon;
grant execute on function public.has_permission(text) to authenticated, anon;
grant execute on function public.get_my_context() to authenticated;
grant execute on function public.create_bottle(uuid, uuid, numeric, numeric, numeric, date, text) to authenticated;
grant execute on function public.adjust_bottle_volume(uuid, numeric, text) to authenticated;
-- handle_new_user and set_updated_at are trigger-only: no EXECUTE grant to anon/authenticated at all.

-- set_updated_at also had a mutable search_path warning; pin it like the other functions.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
