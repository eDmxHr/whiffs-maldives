import { requireAdmin } from "@/lib/auth"
import { collection, fail } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { mapFragranceImage } from "@/lib/supabase/catalog-repository"
import { reorderImagesSchema } from "@/features/catalog/schemas/catalog"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to reorder images.", 401)
  }

  const { id } = await context.params
  const parsed = reorderImagesSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Choose at least one image to reorder.", 422, parsed.error.flatten().fieldErrors)
  }

  const supabase = await createClient()

  const { data: existing } = await supabase.from("fragrance_images").select("id").eq("fragrance_id", id)

  if (!existing?.length) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  const orderedIds = parsed.data.imageIds.filter((imageId) => existing.some((row) => row.id === imageId))

  // Two-phase move: park every row at a high offset first so no intermediate
  // update can collide with the (fragrance_id, position) unique constraint,
  // then assign final positions.
  for (const [index, imageId] of orderedIds.entries()) {
    await supabase
      .from("fragrance_images")
      .update({ position: 1000 + index })
      .eq("id", imageId)
  }

  for (const [index, imageId] of orderedIds.entries()) {
    await supabase.from("fragrance_images").update({ position: index + 1 }).eq("id", imageId)
  }

  const { data } = await supabase.from("fragrance_images").select("*").eq("fragrance_id", id).order("position")

  return collection((data ?? []).map(mapFragranceImage))
}
