import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { fetchFragranceView } from "@/lib/supabase/catalog-repository"

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to publish fragrances.", 401)
  }

  const { id } = await context.params
  const supabase = await createClient()
  const fragrance = await fetchFragranceView(supabase, id)

  if (!fragrance) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  if (!fragrance.name || !fragrance.brandId || !fragrance.description) {
    return fail("INSUFFICIENT_PUBLISH_DATA", "Complete the fragrance profile before publishing.", 422)
  }

  if (!fragrance.images.length || !fragrance.offerings.some((offering) => offering.isActive)) {
    return fail("INVALID_PUBLISH_STATE", "Add at least one image and one active offering before publishing.", 422)
  }

  const { error } = await supabase.from("fragrances").update({ status: "published" }).eq("id", id)

  if (error) {
    return fail("VALIDATION_ERROR", "Could not publish the fragrance.", 422)
  }

  const published = await fetchFragranceView(supabase, id)

  return ok(published)
}
