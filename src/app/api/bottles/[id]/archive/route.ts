import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to archive bottles.", 401)
  }

  const { id } = await context.params
  const bottle = demoStore.archiveBottle(id)

  if (!bottle) {
    return fail("NOT_FOUND", "Bottle was not found.", 404)
  }

  return ok(bottle)
}
