import { z } from "zod"

export const createBottleSchema = z.object({
  fragranceId: z.string().min(1),
  supplierId: z.string().min(1),
  originalVolumeMl: z.number().positive(),
  usableVolumeMl: z.number().positive(),
  purchasePrice: z.number().nonnegative(),
  purchaseDate: z.string().min(1),
  notes: z.string().optional().default(""),
})

export const createSupplierSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional().default(""),
  email: z.string().optional().default(""),
  notes: z.string().optional().default(""),
})
