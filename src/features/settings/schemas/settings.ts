import { z } from "zod"

export const updateSettingsSchema = z.object({
  wasteAllowancePercent: z.number().min(0).max(100),
  lowVolumeThresholdMl: z.number().nonnegative(),
  orderPaymentExpiryHours: z.number().positive(),
  firstOrderDiscountPercent: z.number().min(0).max(100),
  deliveryFeeFlat: z.number().nonnegative(),
  targetGrossMarginPercent: z.number().min(0).max(100),
  gstRatePercent: z.number().min(0).max(100),
  priceRoundingIncrement: z.number().positive(),
  packagingCost: z.number().nonnegative(),
  operationsBuffer: z.number().nonnegative(),
  gstEnabled: z.boolean(),
})
