import { z } from "zod"

export const updateSettingsSchema = z.object({
  wasteAllowancePercent: z.number().min(0).max(100),
  lowVolumeThresholdMl: z.number().nonnegative(),
  orderPaymentExpiryHours: z.number().positive(),
  firstOrderDiscountPercent: z.number().min(0).max(100),
  deliveryFeeFlat: z.number().nonnegative(),
})
