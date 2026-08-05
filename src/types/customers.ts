import type { Order } from "@/types/orders"

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  notes: string
  createdAt: string
}

export interface CustomerView extends Customer {
  orderCount: number
  lifetimeValue: number
  averageOrderValue: number
}

export interface CustomerDetail extends CustomerView {
  orders: Order[]
}
