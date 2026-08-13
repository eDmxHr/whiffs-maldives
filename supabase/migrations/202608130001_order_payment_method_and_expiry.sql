-- Adds payment method + bank-transfer payment expiry to orders, needed for guest checkout
-- (docs/18: bank transfer orders expire after 24h; settings.order_payment_expiry_hours already
-- existed but was never read by any RPC).

alter table public.orders
  add column payment_method text not null default 'bank_transfer'
    check (payment_method in ('bank_transfer', 'cod')),
  add column payment_expires_at timestamptz;

-- create_order gains an optional payment_method param (default keeps existing staff callers
-- working unchanged) and now computes payment_expires_at server-side, same as pricing is
-- server-derived -- never trust the client for either.
drop function if exists public.create_order(uuid, text, text, text, numeric, jsonb);

create or replace function public.create_order(
  p_customer_id uuid,
  p_delivery_method text,
  p_delivery_address text,
  p_notes text,
  p_delivery_fee numeric,
  p_items jsonb,
  p_payment_method text default 'bank_transfer'
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
  v_payment_expires_at timestamptz;
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

  if p_payment_method not in ('bank_transfer', 'cod') then
    raise exception 'VALIDATION_ERROR' using errcode = '22000';
  end if;

  if p_payment_method = 'bank_transfer' then
    select now() + (order_payment_expiry_hours || ' hours')::interval
    into v_payment_expires_at
    from public.settings
    where id = true;
  end if;

  v_order_number := 'WM-' || lpad(nextval('public.order_number_seq')::text, 4, '0');

  insert into public.orders (
    order_number, customer_id, status, payment_status,
    subtotal, delivery_fee, total, delivery_method, delivery_address, notes,
    payment_method, payment_expires_at
  ) values (
    v_order_number, p_customer_id, 'pending_payment', 'pending',
    0, p_delivery_fee, p_delivery_fee, coalesce(p_delivery_method, ''), coalesce(p_delivery_address, ''), coalesce(p_notes, ''),
    p_payment_method, v_payment_expires_at
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

grant execute on function public.create_order(uuid, text, text, text, numeric, jsonb, text) to authenticated;
