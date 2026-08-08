import { apiClient } from "@/lib/api-client"
import type { ApiCollection, ApiSuccess } from "@/types/api"
import type { Order, OrderStatus } from "@/types/orders"

export interface CreateOrderInput {
  customerId: string
  deliveryMethod: string
  deliveryAddress?: string
  notes?: string
  deliveryFee?: number
  items: Array<{ fragranceId: string; offeringId: string; quantity: number }>
}

export async function getOrders() {
  const { data } = await apiClient.get<ApiCollection<Order>>("/orders")
  return data.data
}

export async function createOrder(input: CreateOrderInput) {
  const { data } = await apiClient.post<ApiSuccess<Order>>("/orders", input)
  return data.data
}

export async function getOrder(id: string) {
  const { data } = await apiClient.get<ApiSuccess<Order>>(`/orders/${id}`)
  return data.data
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { data } = await apiClient.patch<ApiSuccess<Order>>(`/orders/${id}/status`, { status })
  return data.data
}

export async function setOrderPaymentProof(id: string, publicUrl: string) {
  const { data } = await apiClient.post<ApiSuccess<Order>>(`/orders/${id}/payment-proof`, { publicUrl })
  return data.data
}

export async function toggleOrderChecklistItem(id: string, checklistItemId: string) {
  const { data } = await apiClient.patch<ApiSuccess<Order>>(`/orders/${id}/checklist/${checklistItemId}`)
  return data.data
}

export async function recordPartialFulfillment(id: string, itemId: string, fulfilledQuantity: number) {
  const { data } = await apiClient.post<ApiSuccess<Order>>(`/orders/${id}/items/${itemId}/fulfill`, { fulfilledQuantity })
  return data.data
}
