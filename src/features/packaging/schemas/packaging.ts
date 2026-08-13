import { z } from "zod"

export const createPackagingItemSchema = z.object({
  name: z.string().min(2),
  unit: z.string().min(1),
  unitCost: z.number().nonnegative(),
  quantity: z.number().nonnegative(),
  minimumQuantity: z.number().nonnegative(),
  decantSizeMl: z.number().positive().nullable().optional(),
})

export const updatePackagingItemSchema = createPackagingItemSchema.partial()
