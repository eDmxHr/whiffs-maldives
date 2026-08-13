-- update_order_status became security definer in 202608130006 (needed so Staff, who has
-- orders.update/orders.fulfill but not inventory.adjust, can still trigger the order-driven
-- bottle commitment/deduction it now performs, bypassing the bottles/order_items RLS policies
-- that would otherwise block them). Its own has_permission('orders.update') check safely returns
-- false for anon (auth.uid() is null, never matches a user_id), so this was never exploitable --
-- but Postgres grants EXECUTE to PUBLIC by default on function creation unless revoked, so anon
-- could invoke it at all. Revoking removes that surface entirely rather than relying solely on
-- the internal check, now that the function bypasses RLS.
revoke execute on function public.update_order_status(uuid, public.order_status) from public;
grant execute on function public.update_order_status(uuid, public.order_status) to authenticated;
