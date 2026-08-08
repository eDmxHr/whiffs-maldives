import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { fetchOrderView } from "@/lib/supabase/orders-repository"

export async function PATCH(_request: Request, context: { params: Promise<{ id: string; itemId: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to update the fulfillment checklist.", 401)
  }

  const { id, itemId } = await context.params
  const supabase = await createClient()

  const { data: item } = await supabase
    .from("fulfillment_checklist_items")
    .select("done")
    .eq("order_id", id)
    .eq("id", itemId)
    .maybeSingle()

  if (!item) {
    return fail("NOT_FOUND", "Order or checklist item was not found.", 404)
  }

  const { error } = await supabase
    .from("fulfillment_checklist_items")
    .update({ done: !item.done })
    .eq("order_id", id)
    .eq("id", itemId)

  if (error) {
    return fail("NOT_FOUND", "Order or checklist item was not found.", 404)
  }

  const order = await fetchOrderView(supabase, id)

  if (!order) {
    return fail("NOT_FOUND", "Order or checklist item was not found.", 404)
  }

  return ok(order)
}
