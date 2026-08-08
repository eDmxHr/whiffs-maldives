import { z } from "zod"

export const createOrderItemSchema = z.object({
  fragranceId: z.string().uuid(),
  offeringId: z.string().uuid(),
  quantity: z.number().int().positive(),
})

export const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  deliveryMethod: z.string().min(1),
  deliveryAddress: z.string().default(""),
  notes: z.string().default(""),
  deliveryFee: z.number().nonnegative().default(0),
  items: z.array(createOrderItemSchema).min(1),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending_payment", "payment_confirmed", "preparing", "ready", "completed", "cancelled"]),
})

export const paymentProofSchema = z.object({
  publicUrl: z.string().url(),
})

export const partialFulfillmentSchema = z.object({
  fulfilledQuantity: z.number().nonnegative(),
})
