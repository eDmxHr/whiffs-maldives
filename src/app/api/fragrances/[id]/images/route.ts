import { requireAdmin } from "@/lib/auth"
import { collection, fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { mapFragranceImage } from "@/lib/supabase/catalog-repository"

const MAX_FILE_SIZE = 8 * 1024 * 1024
const BUCKET = "fragrance-images"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("fragrance_images")
    .select("*")
    .eq("fragrance_id", id)
    .order("position")

  if (error) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  return collection((data ?? []).map(mapFragranceImage))
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to manage fragrance images.", 401)
  }

  const { id } = await context.params
  const supabase = await createClient()

  const { data: fragrance } = await supabase.from("fragrances").select("id").eq("id", id).maybeSingle()

  if (!fragrance) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return fail("VALIDATION_ERROR", "Choose an image file to upload.", 422)
  }

  if (!file.type.startsWith("image/")) {
    return fail("VALIDATION_ERROR", "Only image files are allowed.", 422)
  }

  if (file.size > MAX_FILE_SIZE) {
    return fail("VALIDATION_ERROR", "Images must be 8MB or smaller.", 422)
  }

  const { count } = await supabase
    .from("fragrance_images")
    .select("id", { count: "exact", head: true })
    .eq("fragrance_id", id)

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg"
  const storagePath = `fragrances/${id}/${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
    contentType: file.type,
  })

  if (uploadError) {
    return fail("UPLOAD_FAILED", "Could not upload the image.", 502)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)

  const { data: image, error: insertError } = await supabase
    .from("fragrance_images")
    .insert({
      fragrance_id: id,
      storage_path: storagePath,
      public_url: publicUrl,
      position: (count ?? 0) + 1,
    })
    .select("*")
    .single()

  if (insertError || !image) {
    await supabase.storage.from(BUCKET).remove([storagePath])
    return fail("VALIDATION_ERROR", "Could not save the image.", 422)
  }

  return ok(mapFragranceImage(image), { status: 201 })
}
