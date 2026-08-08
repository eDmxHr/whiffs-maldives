import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { fetchOrderView, recordPartialFulfillmentRpc } from "@/lib/supabase/orders-repository"
import { partialFulfillmentSchema } from "@/features/orders/schemas/orders"

export async function POST(request: Request, context: { params: Promise<{ id: string; itemId: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to record fulfillment.", 401)
  }

  const { id, itemId } = await context.params
  const parsed = partialFulfillmentSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Fulfilled quantity is invalid.", 422, parsed.error.flatten().fieldErrors)
  }

  const supabase = await createClient()
  const { data, error } = await recordPartialFulfillmentRpc(supabase, id, itemId, parsed.data.fulfilledQuantity)

  if (error || !data) {
    if (error?.message?.includes("FORBIDDEN")) {
      return fail("UNAUTHORIZED", "Sign in with an owner account to record fulfillment.", 401)
    }

    if (error?.message?.includes("NOT_FOUND")) {
      return fail("NOT_FOUND", "Order or order item was not found.", 404)
    }

    return fail("VALIDATION_ERROR", "Fulfilled quantity cannot exceed the ordered quantity.", 422)
  }

  const order = await fetchOrderView(supabase, id)

  if (!order) {
    return fail("NOT_FOUND", "Order or order item was not found.", 404)
  }

  return ok(order)
}
