import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to publish fragrances.", 401)
  }

  const { id } = await context.params
  const result = demoStore.publishFragrance(id)

  if ("error" in result) {
    if (result.error === "NOT_FOUND") {
      return fail("NOT_FOUND", "Fragrance was not found.", 404)
    }

    if (result.error === "INSUFFICIENT_PUBLISH_DATA") {
      return fail("INSUFFICIENT_PUBLISH_DATA", "Complete the fragrance profile before publishing.", 422)
    }

    return fail("INVALID_PUBLISH_STATE", "Add at least one image and one active offering before publishing.", 422)
  }

  return ok(result.data)
}
