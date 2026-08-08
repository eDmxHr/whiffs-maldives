import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { fetchOrderView } from "@/lib/supabase/orders-repository"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to view orders.", 401)
  }

  const { id } = await context.params
  const supabase = await createClient()
  const order = await fetchOrderView(supabase, id)

  if (!order) {
    return fail("NOT_FOUND", "Order was not found.", 404)
  }

  return ok(order)
}
