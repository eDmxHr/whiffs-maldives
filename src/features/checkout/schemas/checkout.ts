import { z } from "zod"

import { createOrderItemSchema, paymentMethodSchema } from "@/features/orders/schemas/orders"

export const guestCheckoutSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerEmail: z.string().email().optional().or(z.literal("")),
  deliveryMethod: z.string().min(1),
  deliveryAddress: z.string().min(1),
  notes: z.string().default(""),
  paymentMethod: paymentMethodSchema,
  items: z.array(createOrderItemSchema).min(1),
})

export type GuestCheckoutInput = z.infer<typeof guestCheckoutSchema>
