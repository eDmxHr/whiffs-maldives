import { fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const bottle = demoStore.getBottle(id)

  if (!bottle) {
    return fail("NOT_FOUND", "Bottle was not found.", 404)
  }

  return ok(bottle)
}
