import { requireAdmin } from "@/lib/auth"
import { collection, fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { mapOffering } from "@/lib/supabase/catalog-repository"
import { upsertOfferingsSchema } from "@/features/catalog/schemas/catalog"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data, error } = await supabase.from("offerings").select("*").eq("fragrance_id", id).order("size_ml")

  if (error) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  return collection((data ?? []).map(mapOffering))
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to manage offerings.", 401)
  }

  const { id } = await context.params
  const parsed = upsertOfferingsSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Offering prices are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const uniqueSizes = new Set(parsed.data.offerings.map((offering) => offering.sizeMl))
  if (uniqueSizes.size !== parsed.data.offerings.length) {
    return fail("DUPLICATE_OFFERING_SIZE", "Each decant size can only appear once.", 409)
  }

  const supabase = await createClient()

  const { error: upsertError } = await supabase.from("offerings").upsert(
    parsed.data.offerings.map((offering) => ({
      fragrance_id: id,
      type: "decant",
      name: `${offering.sizeMl}ml`,
      size_ml: offering.sizeMl,
      price: offering.price,
      suggested_price: offering.suggestedPrice,
      is_active: offering.isActive,
    })),
    { onConflict: "fragrance_id,type,size_ml" }
  )

  if (upsertError) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  const keptSizes = parsed.data.offerings.map((offering) => offering.sizeMl)
  await supabase
    .from("offerings")
    .delete()
    .eq("fragrance_id", id)
    .eq("type", "decant")
    .not("size_ml", "in", `(${keptSizes.join(",") || "0"})`)

  const { data } = await supabase.from("offerings").select("*").eq("fragrance_id", id).order("size_ml")

  return ok((data ?? []).map(mapOffering))
}
