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
import type { OrderStatus } from "@/types/orders"

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
  const refreshOrders = () => {
    void queryClient.invalidateQueries({ queryKey: orderKeys.orders })
  }

  return {
    updateStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
      onSuccess: refreshOrders,
    }),
    setPaymentProof: useMutation({
      mutationFn: ({ id, publicUrl }: { id: string; publicUrl: string }) => setOrderPaymentProof(id, publicUrl),
      onSuccess: refreshOrders,
    }),
    toggleChecklistItem: useMutation({
      mutationFn: ({ id, checklistItemId }: { id: string; checklistItemId: string }) =>
        toggleOrderChecklistItem(id, checklistItemId),
      onSuccess: refreshOrders,
    }),
    recordPartialFulfillment: useMutation({
      mutationFn: ({ id, itemId, fulfilledQuantity }: { id: string; itemId: string; fulfilledQuantity: number }) =>
        recordPartialFulfillment(id, itemId, fulfilledQuantity),
      onSuccess: refreshOrders,
    }),
  }
}
