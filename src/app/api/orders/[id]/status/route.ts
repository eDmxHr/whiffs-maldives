import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { fetchOrderView, updateOrderStatusRpc } from "@/lib/supabase/orders-repository"
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

  const supabase = await createClient()
  const { data, error } = await updateOrderStatusRpc(supabase, id, parsed.data.status)

  if (error || !data) {
    if (error?.message?.includes("FORBIDDEN")) {
      return fail("UNAUTHORIZED", "Sign in with an owner account to update orders.", 401)
    }

    if (error?.message?.includes("NOT_FOUND")) {
      return fail("NOT_FOUND", "Order was not found.", 404)
    }

    if (error?.message?.includes("INSUFFICIENT_STOCK")) {
      return fail(
        "INSUFFICIENT_STOCK",
        "Not enough available bottle volume for one or more items — check inventory before confirming payment.",
        409
      )
    }

    return fail("INVALID_STATUS_TRANSITION", "Order cannot move to that status from its current status.", 422)
  }

  const order = await fetchOrderView(supabase, id)

  if (!order) {
    return fail("NOT_FOUND", "Order was not found.", 404)
  }

  return ok(order)
}
