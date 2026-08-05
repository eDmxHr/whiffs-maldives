import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"
import { updateOrderStatusSchema } from "@/features/orders/schemas/orders"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to update orders.", 401)
  }

  const { id } = await context.params
  const parsed = updateOrderStatusSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Order status is invalid.", 422, parsed.error.flatten().fieldErrors)
  }

  const result = demoStore.updateOrderStatus(id, parsed.data.status)

  if ("error" in result) {
    if (result.error === "NOT_FOUND") {
      return fail("NOT_FOUND", "Order was not found.", 404)
    }

    return fail("INVALID_STATUS_TRANSITION", "Order cannot move to that status from its current status.", 422)
  }

  return ok(result.data)
}
