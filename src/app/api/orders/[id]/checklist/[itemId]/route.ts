import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"

export async function PATCH(_request: Request, context: { params: Promise<{ id: string; itemId: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to update the fulfillment checklist.", 401)
  }

  const { id, itemId } = await context.params
  const order = demoStore.toggleOrderChecklistItem(id, itemId)

  if (!order) {
    return fail("NOT_FOUND", "Order or checklist item was not found.", 404)
  }

  return ok(order)
}
