import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"

export async function DELETE(_request: Request, context: { params: Promise<{ id: string; imageId: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to delete images.", 401)
  }

  const { id, imageId } = await context.params
  const deleted = demoStore.deleteImage(id, imageId)

  if (!deleted) {
    return fail("NOT_FOUND", "Fragrance or image was not found.", 404)
  }

  return ok({ deleted: true })
}
