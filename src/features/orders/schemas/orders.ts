import { z } from "zod"

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending_payment", "payment_confirmed", "preparing", "ready", "completed", "cancelled"]),
})

export const paymentProofSchema = z.object({
  publicUrl: z.string().url(),
})

export const partialFulfillmentSchema = z.object({
  fulfilledQuantity: z.number().nonnegative(),
})
