import type { SupabaseClient } from "@supabase/supabase-js"

import type { CustomerDetail, CustomerView } from "@/types/customers"
import type { FulfillmentChecklistItem, Order, OrderItem, OrderStatus } from "@/types/orders"

export function mapCustomer(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: (row.phone as string) ?? "",
    email: (row.email as string) ?? "",
    notes: (row.notes as string) ?? "",
    createdAt: row.created_at as string,
  }
}

export function mapCustomerView(row: Record<string, unknown>, stats?: Record<string, unknown> | null): CustomerView {
  return {
    ...mapCustomer(row),
    orderCount: Number(stats?.order_count ?? 0),
    lifetimeValue: Number(stats?.lifetime_value ?? 0),
    averageOrderValue: Number(stats?.average_order_value ?? 0),
  }
}

export async function fetchCustomerViews(supabase: SupabaseClient): Promise<CustomerView[]> {
  const [{ data: customers, error }, { data: stats }] = await Promise.all([
    supabase.from("customers").select("*").order("name"),
    supabase.from("customer_stats").select("*"),
  ])

  if (error || !customers) {
    return []
  }

  const statsById = new Map((stats ?? []).map((row) => [row.customer_id as string, row as Record<string, unknown>]))

  return customers.map((row) => mapCustomerView(row, statsById.get(row.id as string)))
}

export async function fetchCustomerDetail(supabase: SupabaseClient, id: string): Promise<CustomerDetail | null> {
  const [{ data: customerRow, error }, { data: statsRow }, orders] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).maybeSingle(),
    supabase.from("customer_stats").select("*").eq("customer_id", id).maybeSingle(),
    fetchOrderViews(supabase, { customerId: id }),
  ])

  if (error || !customerRow) {
    return null
  }

  return {
    ...mapCustomerView(customerRow, statsRow),
    orders,
  }
}

function mapOrderItem(row: Record<string, unknown>): OrderItem {
  const fragrance = row.fragrance as Record<string, unknown> | null
  const offering = row.offering as Record<string, unknown> | null

  return {
    id: row.id as string,
    fragranceId: row.fragrance_id as string,
    offeringId: row.offering_id as string,
    fragranceName: (fragrance?.name as string) ?? "",
    offeringName: (offering?.name as string) ?? "",
    sizeMl: Number(row.size_ml),
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    totalPrice: Number(row.total_price),
    fulfilledQuantity: Number(row.fulfilled_quantity),
  }
}

function mapChecklistItem(row: Record<string, unknown>): FulfillmentChecklistItem & { position: number } {
  return {
    id: row.id as string,
    label: row.label as string,
    done: row.done as boolean,
    position: Number(row.position),
  }
}

const ORDER_VIEW_SELECT = `
  *,
  customer:customers(name, phone),
  items:order_items(*, fragrance:fragrances(name), offering:offerings(name)),
  fulfillment_checklist:fulfillment_checklist_items(*)
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrderRow(row: any): Order {
  const customer = row.customer ?? {}

  return {
    id: row.id as string,
    orderNumber: row.order_number as string,
    customerId: row.customer_id as string,
    customerName: (customer.name as string) ?? "",
    customerPhone: (customer.phone as string) ?? "",
    status: row.status as OrderStatus,
    paymentStatus: row.payment_status,
    items: (row.items ?? []).map(mapOrderItem),
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    deliveryMethod: (row.delivery_method as string) ?? "",
    deliveryAddress: (row.delivery_address as string) ?? "",
    notes: (row.notes as string) ?? "",
    paymentProofUrl: (row.payment_proof_url as string) ?? "",
    fulfillmentChecklist: (row.fulfillment_checklist ?? [])
      .map(mapChecklistItem)
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map(
        (item: FulfillmentChecklistItem & { position: number }): FulfillmentChecklistItem => ({
          id: item.id,
          label: item.label,
          done: item.done,
        })
      ),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function fetchOrderView(supabase: SupabaseClient, id: string): Promise<Order | null> {
  const { data, error } = await supabase.from("orders").select(ORDER_VIEW_SELECT).eq("id", id).maybeSingle()

  if (error || !data) {
    return null
  }

  return mapOrderRow(data)
}

export async function fetchOrderViews(
  supabase: SupabaseClient,
  options: { customerId?: string } = {}
): Promise<Order[]> {
  let query = supabase.from("orders").select(ORDER_VIEW_SELECT).order("created_at", { ascending: false })

  if (options.customerId) {
    query = query.eq("customer_id", options.customerId)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data.map(mapOrderRow)
}

export type CreateOrderItemInput = { fragranceId: string; offeringId: string; quantity: number }

export async function createOrderRpc(
  supabase: SupabaseClient,
  input: {
    customerId: string
    deliveryMethod: string
    deliveryAddress: string
    notes: string
    deliveryFee: number
    items: CreateOrderItemInput[]
  }
) {
  return supabase.rpc("create_order", {
    p_customer_id: input.customerId,
    p_delivery_method: input.deliveryMethod,
    p_delivery_address: input.deliveryAddress,
    p_notes: input.notes,
    p_delivery_fee: input.deliveryFee,
    p_items: input.items.map((item) => ({
      fragranceId: item.fragranceId,
      offeringId: item.offeringId,
      quantity: item.quantity,
    })),
  })
}

export async function updateOrderStatusRpc(supabase: SupabaseClient, orderId: string, status: OrderStatus) {
  return supabase.rpc("update_order_status", { p_order_id: orderId, p_next_status: status })
}

export async function recordPartialFulfillmentRpc(
  supabase: SupabaseClient,
  orderId: string,
  orderItemId: string,
  fulfilledQuantity: number
) {
  return supabase.rpc("record_partial_fulfillment", {
    p_order_id: orderId,
    p_order_item_id: orderItemId,
    p_fulfilled_quantity: fulfilledQuantity,
  })
}
