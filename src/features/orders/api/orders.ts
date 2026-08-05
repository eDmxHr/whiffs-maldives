import { apiClient } from "@/lib/api-client"
import type { ApiCollection, ApiSuccess } from "@/types/api"
import type { Order, OrderStatus } from "@/types/orders"

export async function getOrders() {
  const { data } = await apiClient.get<ApiCollection<Order>>("/orders")
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
