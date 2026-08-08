import { requireAdmin } from "@/lib/auth"
import { collection, fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { fetchCustomerViews, mapCustomerView } from "@/lib/supabase/orders-repository"
import { createCustomerSchema } from "@/features/customers/schemas/customers"

export async function GET() {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to view customers.", 401)
  }

  const supabase = await createClient()
  return collection(await fetchCustomerViews(supabase))
}

export async function POST(request: Request) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to add customers.", 401)
  }

  const parsed = createCustomerSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Customer details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      notes: parsed.data.notes || null,
    })
    .select("*")
    .single()

  if (error || !data) {
    return fail("VALIDATION_ERROR", "Could not create the customer.", 422)
  }

  return ok(mapCustomerView(data), { status: 201 })
}
