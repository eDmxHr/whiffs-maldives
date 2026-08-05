import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { mapBottle } from "@/lib/supabase/catalog-repository"
import { updateBottleSchema } from "@/features/inventory/schemas/bottles"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data, error } = await supabase.from("bottles").select("*").eq("id", id).maybeSingle()

  if (error || !data) {
    return fail("NOT_FOUND", "Bottle was not found.", 404)
  }

  return ok(mapBottle(data))
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to update bottles.", 401)
  }

  const { id } = await context.params
  const parsed = updateBottleSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Bottle details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  if (parsed.data.usableVolumeMl > parsed.data.originalVolumeMl || parsed.data.usableVolumeMl <= 0) {
    return fail("VALIDATION_ERROR", "Usable volume must be positive and cannot exceed original volume.", 422)
  }

  const supabase = await createClient()

  const { data: current } = await supabase.from("bottles").select("remaining_volume_ml").eq("id", id).maybeSingle()

  if (!current) {
    return fail("NOT_FOUND", "Bottle was not found.", 404)
  }

  const { data: settings } = await supabase.from("settings").select("low_volume_threshold_ml").eq("id", true).single()
  const threshold = Number(settings?.low_volume_threshold_ml ?? 15)

  const remainingVolumeMl = Math.min(Number(current.remaining_volume_ml), parsed.data.usableVolumeMl)
  const status = remainingVolumeMl <= 0 ? "empty" : remainingVolumeMl <= threshold ? "low_volume" : "available"

  const { data, error } = await supabase
    .from("bottles")
    .update({
      fragrance_id: parsed.data.fragranceId,
      supplier_id: parsed.data.supplierId,
      original_volume_ml: parsed.data.originalVolumeMl,
      usable_volume_ml: parsed.data.usableVolumeMl,
      remaining_volume_ml: remainingVolumeMl,
      purchase_price: parsed.data.purchasePrice,
      purchase_date: parsed.data.purchaseDate,
      notes: parsed.data.notes || null,
      status,
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error || !data) {
    return fail("NOT_FOUND", "Bottle was not found.", 404)
  }

  return ok(mapBottle(data))
}
