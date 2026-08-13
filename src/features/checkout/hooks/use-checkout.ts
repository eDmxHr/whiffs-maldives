"use client"

import { useMutation } from "@tanstack/react-query"

import { submitGuestOrder } from "@/features/checkout/api/checkout"

export function useCheckoutMutation() {
  return useMutation({ mutationFn: submitGuestOrder })
}
