-- Wires up the inventory timing rule from docs/03-business-rules-and-decisions.md that was never
-- implemented: "Placing an unpaid order does not reserve volume. Inventory becomes committed
-- after payment is confirmed. Actual volume deduction occurs when preparation starts." Previously
-- update_order_status only flipped status/payment_status -- nothing ever touched bottle volume,
-- so two orders could both be confirmed against the same last few ml (a real overselling risk).
--
-- committed_volume_ml tracks volume promised to a payment-confirmed-but-not-yet-prepared order,
-- without physically deducting it yet. "Available for new orders" = remaining - committed.
-- order_items.bottle_id records which specific bottle a line item was committed against, so the
-- same bottle is deducted at preparation and released on cancellation.
alter table public.bottles
  add column committed_volume_ml numeric(8, 2) not null default 0 check (committed_volume_ml >= 0),
  add constraint bottles_committed_within_remaining check (committed_volume_ml <= remaining_volume_ml);

alter table public.order_items
  add column bottle_id uuid references public.bottles(id);

-- security definer (unlike the other order RPCs, which are security invoker): Staff has
-- orders.update/orders.fulfill but not inventory.adjust (docs/15's RBAC model deliberately keeps
-- manual inventory adjustment as a Manager+ action). Order-driven commitment/deduction is part of
-- the fulfillment action itself, not a manual adjustment, so this function's own has_permission()
-- check on orders.update is the authorization boundary -- it then acts on bottles/order_items with
-- the elevated privilege needed to do so, the same way a checkout or payment webhook would.
create or replace function public.update_order_status(
  p_order_id uuid,
  p_next_status public.order_status
) returns public.orders
language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders;
  v_allowed public.order_status[];
  v_item record;
  v_bottle public.bottles;
  v_needed numeric;
  v_threshold numeric;
  v_new_remaining numeric;
  v_new_status public.bottle_status;
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

  -- Commit inventory: pick a FIFO bottle per line item with enough *available* volume
  -- (remaining - already committed), so it can't be oversold to another order before prep.
  if p_next_status = 'payment_confirmed' then
    for v_item in select * from public.order_items where order_id = p_order_id for update
    loop
      v_needed := v_item.size_ml * v_item.quantity;

      select * into v_bottle
      from public.bottles
      where fragrance_id = v_item.fragrance_id
        and status in ('available', 'low_volume')
        and (remaining_volume_ml - committed_volume_ml) >= v_needed
      order by received_at asc
      limit 1
      for update;

      if not found then
        raise exception 'INSUFFICIENT_STOCK' using errcode = '22000';
      end if;

      update public.bottles
      set committed_volume_ml = committed_volume_ml + v_needed, updated_at = now()
      where id = v_bottle.id;

      update public.order_items set bottle_id = v_bottle.id where id = v_item.id;

      insert into public.inventory_events (bottle_id, type, quantity_ml, balance_after_ml, reference_type, reference_id, reason)
      values (
        v_bottle.id, 'reserved', -v_needed,
        v_bottle.remaining_volume_ml - (v_bottle.committed_volume_ml + v_needed),
        'order', p_order_id, 'Reserved at payment confirmation'
      );
    end loop;
  end if;

  -- Deduct for real: the decant is physically filled now, so the commitment becomes an actual
  -- reduction in remaining volume.
  if p_next_status = 'preparing' then
    select low_volume_threshold_ml into v_threshold from public.settings where id;

    for v_item in select * from public.order_items where order_id = p_order_id and bottle_id is not null for update
    loop
      v_needed := v_item.size_ml * v_item.quantity;

      select * into v_bottle from public.bottles where id = v_item.bottle_id for update;
      v_new_remaining := greatest(0, v_bottle.remaining_volume_ml - v_needed);
      v_new_status := case
        when v_new_remaining <= 0 then 'empty'
        when v_new_remaining <= v_threshold then 'low_volume'
        else 'available'
      end;

      update public.bottles
      set remaining_volume_ml = v_new_remaining,
          committed_volume_ml = greatest(0, committed_volume_ml - v_needed),
          status = v_new_status,
          updated_at = now()
      where id = v_bottle.id;

      insert into public.inventory_events (bottle_id, type, quantity_ml, balance_after_ml, reference_type, reference_id, reason)
      values (v_bottle.id, 'fulfilled', -v_needed, v_new_remaining, 'order', p_order_id, 'Deducted at preparation start');
    end loop;
  end if;

  -- Cancelling a payment-confirmed-but-not-yet-prepared order releases its commitment. Cancelling
  -- after preparation has started does not restore volume -- the fragrance was already poured.
  if p_next_status = 'cancelled' and v_order.status = 'payment_confirmed' then
    for v_item in select * from public.order_items where order_id = p_order_id and bottle_id is not null for update
    loop
      v_needed := v_item.size_ml * v_item.quantity;

      update public.bottles
      set committed_volume_ml = greatest(0, committed_volume_ml - v_needed), updated_at = now()
      where id = v_item.bottle_id
      returning * into v_bottle;

      insert into public.inventory_events (bottle_id, type, quantity_ml, balance_after_ml, reference_type, reference_id, reason)
      values (
        v_item.bottle_id, 'returned', v_needed, v_bottle.remaining_volume_ml - v_bottle.committed_volume_ml,
        'order', p_order_id, 'Reservation released on cancellation'
      );

      update public.order_items set bottle_id = null where id = v_item.id;
    end loop;
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
