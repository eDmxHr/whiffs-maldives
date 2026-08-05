import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"
import { updatePackagingItemSchema } from "@/features/packaging/schemas/packaging"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to update packaging items.", 401)
  }

  const { id } = await context.params
  const parsed = updatePackagingItemSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Packaging item details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const item = demoStore.updatePackagingItem(id, parsed.data)

  if (!item) {
    return fail("NOT_FOUND", "Packaging item was not found.", 404)
  }

  return ok(item)
}
