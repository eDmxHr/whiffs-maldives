import { requireAdmin } from "@/lib/auth"
import { collection, fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { createOrderRpc, fetchOrderView, fetchOrderViews } from "@/lib/supabase/orders-repository"
import { createOrderSchema } from "@/features/orders/schemas/orders"

export async function GET() {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to view orders.", 401)
  }

  const supabase = await createClient()
  return collection(await fetchOrderViews(supabase))
}

export async function POST(request: Request) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to create orders.", 401)
  }

  const parsed = createOrderSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Order details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const supabase = await createClient()
  const { data, error } = await createOrderRpc(supabase, parsed.data)

  if (error || !data) {
    if (error?.message?.includes("FORBIDDEN")) {
      return fail("UNAUTHORIZED", "Sign in with an owner account to create orders.", 401)
    }

    if (error?.message?.includes("NOT_FOUND")) {
      return fail("NOT_FOUND", "Customer was not found.", 404)
    }

    return fail("VALIDATION_ERROR", "Order items are invalid.", 422)
  }

  const order = await fetchOrderView(supabase, data.id)

  if (!order) {
    return fail("VALIDATION_ERROR", "Could not create the order.", 422)
  }

  return ok(order, { status: 201 })
}
