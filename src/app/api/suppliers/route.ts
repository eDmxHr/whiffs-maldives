import { requireAdmin } from "@/lib/auth"
import { collection, fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { mapSupplier } from "@/lib/supabase/catalog-repository"
import { createSupplierSchema } from "@/features/inventory/schemas/bottles"

export async function GET() {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to view suppliers.", 401)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from("suppliers").select("*").order("name")

  if (error || !data) {
    return collection([])
  }

  return collection(data.map(mapSupplier))
}

export async function POST(request: Request) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to add suppliers.", 401)
  }

  const parsed = createSupplierSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Supplier details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      notes: parsed.data.notes || null,
    })
    .select("*")
    .single()

  if (error || !data) {
    return fail("VALIDATION_ERROR", "Could not create the supplier.", 422)
  }

  return ok(mapSupplier(data), { status: 201 })
}
