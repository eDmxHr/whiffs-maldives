import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { fetchOrderView } from "@/lib/supabase/orders-repository"
import { paymentProofSchema } from "@/features/orders/schemas/orders"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to attach payment proof.", 401)
  }

  const { id } = await context.params
  const parsed = paymentProofSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Payment proof is invalid.", 422, parsed.error.flatten().fieldErrors)
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("orders")
    .update({ payment_proof_url: parsed.data.publicUrl })
    .eq("id", id)

  if (error) {
    return fail("NOT_FOUND", "Order was not found.", 404)
  }

  const order = await fetchOrderView(supabase, id)

  if (!order) {
    return fail("NOT_FOUND", "Order was not found.", 404)
  }

  return ok(order)
}
