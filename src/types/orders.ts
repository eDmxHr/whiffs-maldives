export type OrderStatus =
  | "pending_payment"
  | "payment_confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled"

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export type PaymentMethod = "bank_transfer" | "cod"

export interface OrderItem {
  id: string
  fragranceId: string
  offeringId: string
  fragranceName: string
  offeringName: string
  sizeMl: number
  quantity: number
  unitPrice: number
  totalPrice: number
  fulfilledQuantity: number
}

export interface FulfillmentChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  paymentExpiresAt: string | null
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  deliveryMethod: string
  deliveryAddress: string
  notes: string
  paymentProofUrl: string
  fulfillmentChecklist: FulfillmentChecklistItem[]
  createdAt: string
  updatedAt: string
}

// What create_guest_order's `returns public.orders` gives an anonymous caller directly --
// RLS blocks a follow-up select (orders.view is staff-only), so this is deliberately lighter
// than Order: no joined customer/items, since the checkout UI already has those client-side.
export interface GuestOrderConfirmation {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  paymentExpiresAt: string | null
  subtotal: number
  deliveryFee: number
  total: number
  deliveryMethod: string
  deliveryAddress: string
  createdAt: string
}
