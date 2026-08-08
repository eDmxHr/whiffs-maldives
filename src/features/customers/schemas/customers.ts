import { z } from "zod"

export const createCustomerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().default(""),
})
