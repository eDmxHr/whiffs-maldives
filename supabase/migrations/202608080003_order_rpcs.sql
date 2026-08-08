-- Atomic order writes, following the create_bottle/adjust_bottle_volume precedent in
-- 202608050003_settings.sql: invariants (status transitions, price derivation, subtotal/total
-- recompute) are enforced in Postgres, not just in the Next.js route.

grant usage, select on sequence public.order_number_seq to authenticated;

-- Creates an order + its line items + the default fulfillment checklist in one transaction.
-- Prices are always derived server-side from the active offering, never trusted from the client.
create or replace function public.create_order(
  p_customer_id uuid,
  p_delivery_method text,
  p_delivery_address text,
  p_notes text,
  p_delivery_fee numeric,
  p_items jsonb
) returns public.orders
language plpgsql security invoker set search_path = public as $$
declare
  v_order public.orders;
  v_order_number text;
  v_item jsonb;
  v_offering public.offerings;
  v_quantity integer;
  v_unit_price numeric;
  v_total_price numeric;
  v_subtotal numeric := 0;
begin
  if not public.has_permission('orders.create') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if not exists (select 1 from public.customers where id = p_customer_id) then
    raise exception 'NOT_FOUND' using errcode = 'P0002';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'VALIDATION_ERROR' using errcode = '22000';
  end if;

  v_order_number := 'WM-' || lpad(nextval('public.order_number_seq')::text, 4, '0');

  insert into public.orders (
    order_number, customer_id, status, payment_status,
    subtotal, delivery_fee, total, delivery_method, delivery_address, notes
  ) values (
    v_order_number, p_customer_id, 'pending_payment', 'pending',
    0, p_delivery_fee, p_delivery_fee, coalesce(p_delivery_method, ''), coalesce(p_delivery_address, ''), coalesce(p_notes, '')
  )
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'VALIDATION_ERROR' using errcode = '22000';
    end if;

    select * into v_offering
    from public.offerings
    where id = (v_item->>'offeringId')::uuid
      and fragrance_id = (v_item->>'fragranceId')::uuid
      and is_active = true;

    if not found then
      raise exception 'VALIDATION_ERROR' using errcode = '22000';
    end if;

    v_unit_price := v_offering.price;
    v_total_price := v_unit_price * v_quantity;
    v_subtotal := v_subtotal + v_total_price;

    insert into public.order_items (
      order_id, fragrance_id, offering_id, size_ml, quantity, unit_price, total_price, fulfilled_quantity
    ) values (
      v_order.id, v_offering.fragrance_id, v_offering.id, v_offering.size_ml,
      v_quantity, v_unit_price, v_total_price, 0
    );
  end loop;

  insert into public.fulfillment_checklist_items (id, order_id, label, done, position) values
    ('collect', v_order.id, 'Collect atomizers and packaging materials', false, 1),
    ('fill', v_order.id, 'Fill decants', false, 2),
    ('quality', v_order.id, 'Quality check', false, 3),
    ('package', v_order.id, 'Package order', false, 4);

  update public.orders
  set subtotal = v_subtotal, total = v_subtotal + p_delivery_fee, updated_at = now()
  where id = v_order.id
  returning * into v_order;

  return v_order;
end;
$$;

grant execute on function public.create_order(uuid, text, text, text, numeric, jsonb) to authenticated;

-- Re-implements the exact transition table from the old demo-store.ts in Postgres so it can
-- never be bypassed by a stray direct write, and row-locks so two concurrent status changes
-- on the same order can't race past each other's precondition check.
create or replace function public.update_order_status(
  p_order_id uuid,
  p_next_status public.order_status
) returns public.orders
language plpgsql security invoker set search_path = public as $$
declare
  v_order public.orders;
  v_allowed public.order_status[];
begin
  if not public.has_permission('orders.update') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;

  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0002';
  end if;

  v_allowed := case v_order.status
    when 'pending_payment' then array['payment_confirmed', 'cancelled']::public.order_status[]
    when 'payment_confirmed' then array['preparing', 'cancelled']::public.order_status[]
    when 'preparing' then array['ready', 'cancelled']::public.order_status[]
    when 'ready' then array['completed', 'cancelled']::public.order_status[]
    else array[]::public.order_status[]
  end;

  if not (p_next_status = any(v_allowed)) then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = '22000';
  end if;

  update public.orders
  set status = p_next_status,
      payment_status = case when p_next_status = 'payment_confirmed' then 'paid'::public.payment_status else payment_status end,
      updated_at = now()
  where id = p_order_id
  returning * into v_order;

  return v_order;
end;
$$;

grant execute on function public.update_order_status(uuid, public.order_status) to authenticated;

-- Recomputes one item's fulfilled quantity/total and the parent order's subtotal/total in the
-- same transaction, row-locked, so concurrent fulfillment of different items on one order can't
-- produce an inconsistent subtotal.
create or replace function public.record_partial_fulfillment(
  p_order_id uuid,
  p_order_item_id uuid,
  p_fulfilled_quantity integer
) returns public.orders
language plpgsql security invoker set search_path = public as $$
declare
  v_item public.order_items;
  v_order public.orders;
begin
  if not public.has_permission('orders.fulfill') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  select * into v_item from public.order_items where id = p_order_item_id and order_id = p_order_id for update;

  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0002';
  end if;

  if p_fulfilled_quantity < 0 or p_fulfilled_quantity > v_item.quantity then
    raise exception 'VALIDATION_ERROR' using errcode = '22000';
  end if;

  update public.order_items
  set fulfilled_quantity = p_fulfilled_quantity,
      total_price = unit_price * p_fulfilled_quantity,
      updated_at = now()
  where id = p_order_item_id;

  select * into v_order from public.orders where id = p_order_id for update;

  update public.orders
  set subtotal = (select coalesce(sum(total_price), 0) from public.order_items where order_id = p_order_id),
      total = (select coalesce(sum(total_price), 0) from public.order_items where order_id = p_order_id) + v_order.delivery_fee,
      updated_at = now()
  where id = p_order_id
  returning * into v_order;

  return v_order;
end;
$$;

grant execute on function public.record_partial_fulfillment(uuid, uuid, integer) to authenticated;
