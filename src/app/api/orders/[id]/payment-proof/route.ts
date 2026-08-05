import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"
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

  const order = demoStore.setOrderPaymentProof(id, parsed.data.publicUrl)

  if (!order) {
    return fail("NOT_FOUND", "Order was not found.", 404)
  }

  return ok(order)
}
