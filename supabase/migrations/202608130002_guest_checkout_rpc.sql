-- Guest checkout: the only public, unauthenticated write path in the app. Every other order
-- mutation is staff-gated via has_permission(); this function is security definer specifically
-- so anon/authenticated customers can create an order without any RLS policy opening up direct
-- anon insert access to customers/orders/order_items.
--
-- No email/OTP verification -- staff verify payment manually via the existing payment-proof
-- flow, same as admin-entered orders. No rate limiting is applied here either; accepted as an
-- MVP risk since every order already goes through manual staff review before payment is
-- confirmed.

create or replace function public.create_guest_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_delivery_method text,
  p_delivery_address text,
  p_notes text,
  p_payment_method text,
  p_items jsonb
) returns public.orders
language plpgsql security definer set search_path = public as $$
declare
  v_customer_id uuid;
  v_order public.orders;
  v_order_number text;
  v_item jsonb;
  v_offering public.offerings;
  v_quantity integer;
  v_unit_price numeric;
  v_total_price numeric;
  v_subtotal numeric := 0;
  v_payment_expires_at timestamptz;
  v_delivery_fee numeric := 0;
begin
  if p_customer_name is null or length(trim(p_customer_name)) = 0 then
    raise exception 'VALIDATION_ERROR' using errcode = '22000';
  end if;

  if p_customer_phone is null or length(trim(p_customer_phone)) = 0 then
    raise exception 'VALIDATION_ERROR' using errcode = '22000';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'VALIDATION_ERROR' using errcode = '22000';
  end if;

  if p_payment_method not in ('bank_transfer', 'cod') then
    raise exception 'VALIDATION_ERROR' using errcode = '22000';
  end if;

  select id into v_customer_id from public.customers where phone = p_customer_phone limit 1;

  if not found then
    insert into public.customers (name, phone, email)
    values (p_customer_name, p_customer_phone, nullif(p_customer_email, ''))
    returning id into v_customer_id;
  end if;

  select delivery_fee_flat into v_delivery_fee from public.settings where id = true;
  v_delivery_fee := coalesce(v_delivery_fee, 0);

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
    v_order_number, v_customer_id, 'pending_payment', 'pending',
    0, v_delivery_fee, v_delivery_fee, coalesce(p_delivery_method, ''), coalesce(p_delivery_address, ''), coalesce(p_notes, ''),
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
  set subtotal = v_subtotal, total = v_subtotal + v_delivery_fee, updated_at = now()
  where id = v_order.id
  returning * into v_order;

  return v_order;
end;
$$;

grant execute on function public.create_guest_order(text, text, text, text, text, text, text, jsonb) to anon, authenticated;
