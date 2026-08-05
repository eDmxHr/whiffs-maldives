import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"

const BUCKET = "fragrance-images"

export async function DELETE(_request: Request, context: { params: Promise<{ id: string; imageId: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to delete images.", 401)
  }

  const { id, imageId } = await context.params
  const supabase = await createClient()

  const { data: image } = await supabase
    .from("fragrance_images")
    .select("id, storage_path")
    .eq("id", imageId)
    .eq("fragrance_id", id)
    .maybeSingle()

  if (!image) {
    return fail("NOT_FOUND", "Fragrance or image was not found.", 404)
  }

  const { error: deleteError } = await supabase.from("fragrance_images").delete().eq("id", imageId)

  if (deleteError) {
    return fail("NOT_FOUND", "Fragrance or image was not found.", 404)
  }

  await supabase.storage.from(BUCKET).remove([image.storage_path])

  const { data: remaining } = await supabase
    .from("fragrance_images")
    .select("id")
    .eq("fragrance_id", id)
    .order("position")

  if (remaining?.length) {
    // Sequential + ascending: each row vacates its old position before the next row claims it,
    // which keeps every intermediate state compatible with the (fragrance_id, position) unique constraint.
    for (const [index, row] of remaining.entries()) {
      await supabase.from("fragrance_images").update({ position: index + 1 }).eq("id", row.id)
    }
  }

  return ok({ deleted: true })
}
