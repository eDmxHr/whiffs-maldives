export type OrderStatus =
  | "pending_payment"
  | "payment_confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled"

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

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
