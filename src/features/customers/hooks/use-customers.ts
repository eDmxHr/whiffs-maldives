"use client"

import { useQuery } from "@tanstack/react-query"

import { getCustomer, getCustomers } from "@/features/customers/api/customers"

export const customerKeys = {
  customers: ["customers"] as const,
  customer: (id: string) => ["customers", id] as const,
}

export function useCustomers() {
  return useQuery({ queryKey: customerKeys.customers, queryFn: getCustomers })
}

export function useCustomer(id: string) {
  return useQuery({ queryKey: customerKeys.customer(id), queryFn: () => getCustomer(id), enabled: Boolean(id) })
}
