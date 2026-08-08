"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createCustomer,
  getCustomer,
  getCustomers,
  type CreateCustomerInput,
} from "@/features/customers/api/customers"

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

export function useCustomerMutations() {
  const queryClient = useQueryClient()

  return {
    createCustomer: useMutation({
      mutationFn: (input: CreateCustomerInput) => createCustomer(input),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: customerKeys.customers })
      },
    }),
  }
}
