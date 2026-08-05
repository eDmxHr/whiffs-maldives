import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { fetchFragranceView, findOrCreateNotes } from "@/lib/supabase/catalog-repository"
import { createFragranceSchema } from "@/features/catalog/schemas/catalog"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const supabase = await createClient()
  const fragrance = await fetchFragranceView(supabase, id)

  if (!fragrance) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  return ok(fragrance)
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to update fragrances.", 401)
  }

  const { id } = await context.params
  const parsed = createFragranceSchema.partial().safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Fragrance details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const supabase = await createClient()
  const { notes, ...scalarInput } = parsed.data

  const updates: Record<string, unknown> = {}
  if (scalarInput.brandId !== undefined) updates.brand_id = scalarInput.brandId
  if (scalarInput.name !== undefined) updates.name = scalarInput.name
  if (scalarInput.description !== undefined) updates.description = scalarInput.description
  if (scalarInput.concentration !== undefined) updates.concentration = scalarInput.concentration || null
  if (scalarInput.releaseYear !== undefined) updates.release_year = scalarInput.releaseYear
  if (scalarInput.perfumer !== undefined) updates.perfumer = scalarInput.perfumer || null
  if (scalarInput.gender !== undefined) updates.gender = scalarInput.gender || null

  if (Object.keys(updates).length) {
    const { error } = await supabase.from("fragrances").update(updates).eq("id", id)

    if (error) {
      return fail("VALIDATION_ERROR", "Could not update the fragrance.", 422)
    }
  }

  if (notes) {
    await findOrCreateNotes(supabase, id, notes)
  }

  const fragrance = await fetchFragranceView(supabase, id)

  if (!fragrance) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  return ok(fragrance)
}
