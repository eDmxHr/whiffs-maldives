import { requireAdmin } from "@/lib/auth"
import { collection, fail } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"
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

  const images = demoStore.reorderImages(id, parsed.data.imageIds)

  if (!images) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  return collection(images)
}
