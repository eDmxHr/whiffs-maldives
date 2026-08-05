import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to archive fragrances.", 401)
  }

  const { id } = await context.params
  const fragrance = demoStore.archiveFragrance(id)

  if (!fragrance) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  return ok(fragrance)
}
