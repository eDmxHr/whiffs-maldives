create table public.settings (
  id boolean primary key default true check (id),
  waste_allowance_percent numeric not null default 4,
  low_volume_threshold_ml numeric not null default 15,
  order_payment_expiry_hours numeric not null default 24,
  first_order_discount_percent numeric not null default 10,
  delivery_fee_flat numeric not null default 0,
  target_gross_margin_percent numeric not null default 40,
  gst_rate_percent numeric not null default 8,
  price_rounding_increment numeric not null default 5,
  packaging_cost numeric not null default 12,
  operations_buffer numeric not null default 5,
  gst_enabled boolean not null default false,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

insert into public.settings (id) values (true) on conflict (id) do nothing;

alter table public.settings enable row level security;

create policy "Authenticated users can read settings" on public.settings
  for select using (public.is_authenticated());
create policy "settings.manage can update settings" on public.settings
  for update using (public.has_permission('settings.manage')) with check (public.has_permission('settings.manage'));

-- Atomic bottle creation: insert bottle + initial_stock inventory event together
create or replace function public.create_bottle(
  p_fragrance_id uuid,
  p_supplier_id uuid,
  p_original_volume_ml numeric,
  p_usable_volume_ml numeric,
  p_purchase_price numeric,
  p_purchase_date date,
  p_notes text
) returns public.bottles
language plpgsql security invoker set search_path = public as $$
declare
  v_bottle public.bottles;
begin
  if not public.has_permission('inventory.create') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if p_usable_volume_ml <= 0 or p_usable_volume_ml > p_original_volume_ml then
    raise exception 'VALIDATION_ERROR' using errcode = '22000';
  end if;

  insert into public.bottles (
    fragrance_id, supplier_id, original_volume_ml, usable_volume_ml,
    remaining_volume_ml, purchase_price, purchase_date, status, notes
  )
  values (
    p_fragrance_id, p_supplier_id, p_original_volume_ml, p_usable_volume_ml,
    p_usable_volume_ml, p_purchase_price, p_purchase_date, 'available', p_notes
  )
  returning * into v_bottle;

  insert into public.inventory_events (bottle_id, type, quantity_ml, balance_after_ml, reason, created_by)
  values (v_bottle.id, 'initial_stock', v_bottle.usable_volume_ml, v_bottle.usable_volume_ml, 'Initial bottle entry', auth.uid());

  return v_bottle;
end;
$$;

grant execute on function public.create_bottle(uuid, uuid, numeric, numeric, numeric, date, text) to authenticated;

-- Atomic bottle volume adjustment: row-lock, clamp, recompute status, log event
create or replace function public.adjust_bottle_volume(
  p_bottle_id uuid,
  p_quantity_ml numeric,
  p_reason text
) returns public.bottles
language plpgsql security invoker set search_path = public as $$
declare
  v_bottle public.bottles;
  v_balance numeric;
  v_status public.bottle_status;
  v_threshold numeric;
begin
  if not public.has_permission('inventory.adjust') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  select * into v_bottle from public.bottles where id = p_bottle_id for update;

  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0002';
  end if;

  select low_volume_threshold_ml into v_threshold from public.settings where id;

  v_balance := greatest(0, least(v_bottle.usable_volume_ml, v_bottle.remaining_volume_ml + p_quantity_ml));
  v_status := case
    when v_balance <= 0 then 'empty'
    when v_balance <= v_threshold then 'low_volume'
    else 'available'
  end;

  update public.bottles
  set remaining_volume_ml = v_balance, status = v_status, updated_at = now()
  where id = p_bottle_id
  returning * into v_bottle;

  insert into public.inventory_events (bottle_id, type, quantity_ml, balance_after_ml, reason, created_by)
  values (p_bottle_id, 'adjustment', p_quantity_ml, v_balance, p_reason, auth.uid());

  return v_bottle;
end;
$$;

grant execute on function public.adjust_bottle_volume(uuid, numeric, text) to authenticated;
