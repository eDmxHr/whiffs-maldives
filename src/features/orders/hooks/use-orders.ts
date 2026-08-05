"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getOrder,
  getOrders,
  recordPartialFulfillment,
  setOrderPaymentProof,
  toggleOrderChecklistItem,
  updateOrderStatus,
} from "@/features/orders/api/orders"
import type { Order, OrderStatus } from "@/types/orders"

export const orderKeys = {
  orders: ["orders"] as const,
  order: (id: string) => ["orders", id] as const,
}

export function useOrders() {
  return useQuery({ queryKey: orderKeys.orders, queryFn: getOrders })
}

export function useOrder(id: string) {
  return useQuery({ queryKey: orderKeys.order(id), queryFn: () => getOrder(id), enabled: Boolean(id) })
}

export function useOrderMutations() {
  const queryClient = useQueryClient()
  const refreshOrder = (order: Order) => {
    void queryClient.invalidateQueries({ queryKey: orderKeys.orders })
    void queryClient.invalidateQueries({ queryKey: orderKeys.order(order.id) })
  }

  return {
    updateStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
      onSuccess: refreshOrder,
    }),
    setPaymentProof: useMutation({
      mutationFn: ({ id, publicUrl }: { id: string; publicUrl: string }) => setOrderPaymentProof(id, publicUrl),
      onSuccess: refreshOrder,
    }),
    toggleChecklistItem: useMutation({
      mutationFn: ({ id, checklistItemId }: { id: string; checklistItemId: string }) =>
        toggleOrderChecklistItem(id, checklistItemId),
      onSuccess: refreshOrder,
    }),
    recordPartialFulfillment: useMutation({
      mutationFn: ({ id, itemId, fulfilledQuantity }: { id: string; itemId: string; fulfilledQuantity: number }) =>
        recordPartialFulfillment(id, itemId, fulfilledQuantity),
      onSuccess: refreshOrder,
    }),
  }
}
