import { fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { createGuestOrderRpc, mapGuestOrderRow } from "@/lib/supabase/orders-repository"
import { guestCheckoutSchema } from "@/features/checkout/schemas/checkout"

// The one intentionally public write endpoint in the app -- no requireAdmin() gate. Guest
// checkout is deliberately anonymous (no OTP/email verification); staff verify payment
// manually via the existing payment-proof flow, same as admin-entered orders. Validity of
// items/pricing is enforced server-side in the create_guest_order RPC, never trusted from
// the client.
export async function POST(request: Request) {
  const parsed = guestCheckoutSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Order details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const supabase = await createClient()
  const { data, error } = await createGuestOrderRpc(supabase, {
    customerName: parsed.data.customerName,
    customerPhone: parsed.data.customerPhone,
    customerEmail: parsed.data.customerEmail ?? "",
    deliveryMethod: parsed.data.deliveryMethod,
    deliveryAddress: parsed.data.deliveryAddress,
    notes: parsed.data.notes,
    paymentMethod: parsed.data.paymentMethod,
    items: parsed.data.items,
  })

  if (error || !data) {
    return fail("VALIDATION_ERROR", "Could not place the order. Please check your cart and try again.", 422)
  }

  return ok(mapGuestOrderRow(data), { status: 201 })
}
