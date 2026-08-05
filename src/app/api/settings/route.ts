import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { updateSettingsSchema } from "@/features/settings/schemas/settings"
import type { Settings } from "@/types/settings"

function mapSettings(row: Record<string, unknown>): Settings {
  return {
    wasteAllowancePercent: Number(row.waste_allowance_percent),
    lowVolumeThresholdMl: Number(row.low_volume_threshold_ml),
    orderPaymentExpiryHours: Number(row.order_payment_expiry_hours),
    firstOrderDiscountPercent: Number(row.first_order_discount_percent),
    deliveryFeeFlat: Number(row.delivery_fee_flat),
    targetGrossMarginPercent: Number(row.target_gross_margin_percent),
    gstRatePercent: Number(row.gst_rate_percent),
    priceRoundingIncrement: Number(row.price_rounding_increment),
    packagingCost: Number(row.packaging_cost),
    operationsBuffer: Number(row.operations_buffer),
    gstEnabled: Boolean(row.gst_enabled),
  }
}

export async function GET() {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to view settings.", 401)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from("settings").select("*").eq("id", true).single()

  if (error || !data) {
    return fail("NOT_FOUND", "Settings were not found.", 404)
  }

  return ok(mapSettings(data))
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to update settings.", 401)
  }

  const parsed = updateSettingsSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Settings values are invalid.", 422, parsed.error.flatten().fieldErrors)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("settings")
    .update({
      waste_allowance_percent: parsed.data.wasteAllowancePercent,
      low_volume_threshold_ml: parsed.data.lowVolumeThresholdMl,
      order_payment_expiry_hours: parsed.data.orderPaymentExpiryHours,
      first_order_discount_percent: parsed.data.firstOrderDiscountPercent,
      delivery_fee_flat: parsed.data.deliveryFeeFlat,
      target_gross_margin_percent: parsed.data.targetGrossMarginPercent,
      gst_rate_percent: parsed.data.gstRatePercent,
      price_rounding_increment: parsed.data.priceRoundingIncrement,
      packaging_cost: parsed.data.packagingCost,
      operations_buffer: parsed.data.operationsBuffer,
      gst_enabled: parsed.data.gstEnabled,
      updated_by: admin.demoMode ? null : admin.id,
    })
    .eq("id", true)
    .select("*")
    .single()

  if (error || !data) {
    return fail("VALIDATION_ERROR", "Could not update settings.", 422)
  }

  return ok(mapSettings(data))
}
