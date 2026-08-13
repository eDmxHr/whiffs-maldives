import { requireAdmin } from "@/lib/auth"
import { collection, fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { mapPackagingItem } from "@/lib/supabase/catalog-repository"
import { createPackagingItemSchema } from "@/features/packaging/schemas/packaging"

export async function GET() {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to view packaging items.", 401)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from("packaging_items").select("*").order("name")

  if (error || !data) {
    return collection([])
  }

  return collection(data.map(mapPackagingItem))
}

export async function POST(request: Request) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to add packaging items.", 401)
  }

  const parsed = createPackagingItemSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Packaging item details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("packaging_items")
    .insert({
      name: parsed.data.name,
      unit: parsed.data.unit,
      unit_cost: parsed.data.unitCost,
      quantity: parsed.data.quantity,
      minimum_quantity: parsed.data.minimumQuantity,
      decant_size_ml: parsed.data.decantSizeMl ?? null,
    })
    .select("*")
    .single()

  if (error || !data) {
    return fail("VALIDATION_ERROR", "Could not create the packaging item.", 422)
  }

  return ok(mapPackagingItem(data), { status: 201 })
}
