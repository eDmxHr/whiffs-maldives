import { z } from "zod"

export const createBrandSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(""),
})

export const fragranceNoteSchema = z.object({
  id: z.string().optional().default(""),
  name: z.string().min(2),
  category: z.string().optional().default(""),
  pyramidLevel: z.enum(["top", "heart", "base"]),
  position: z.number().int().positive().default(1),
})

export const createFragranceSchema = z.object({
  brandId: z.string().min(1),
  name: z.string().min(2),
  description: z.string().min(10),
  concentration: z.string().optional().default(""),
  releaseYear: z.number().int().min(1800).max(2100).optional(),
  perfumer: z.string().optional().default(""),
  gender: z.string().optional().default(""),
  isFeatured: z.boolean().optional().default(false),
  isBestSeller: z.boolean().optional().default(false),
  notes: z.array(fragranceNoteSchema).default([]),
})

export const reorderImagesSchema = z.object({
  imageIds: z.array(z.string()).min(1),
})

export const offeringInputSchema = z.object({
  sizeMl: z.number().positive(),
  price: z.number().nonnegative(),
  suggestedPrice: z.number().nonnegative(),
  isActive: z.boolean(),
})

export const upsertOfferingsSchema = z.object({
  offerings: z.array(offeringInputSchema).min(1),
})
