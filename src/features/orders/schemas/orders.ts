import { z } from "zod"

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending_payment", "payment_confirmed", "preparing", "ready", "completed", "cancelled"]),
})
