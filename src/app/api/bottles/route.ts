import { requireAdmin } from "@/lib/auth"
import { collection, fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { mapBottle } from "@/lib/supabase/catalog-repository"
import { createBottleSchema } from "@/features/inventory/schemas/bottles"

export async function GET() {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to view bottles.", 401)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from("bottles").select("*").order("received_at", { ascending: false })

  if (error || !data) {
    return collection([])
  }

  return collection(data.map(mapBottle))
}

export async function POST(request: Request) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to add bottles.", 401)
  }

  const parsed = createBottleSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Bottle details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("create_bottle", {
    p_fragrance_id: parsed.data.fragranceId,
    p_supplier_id: parsed.data.supplierId,
    p_original_volume_ml: parsed.data.originalVolumeMl,
    p_usable_volume_ml: parsed.data.usableVolumeMl,
    p_purchase_price: parsed.data.purchasePrice,
    p_purchase_date: parsed.data.purchaseDate,
    p_notes: parsed.data.notes || null,
  })

  if (error || !data) {
    if (error?.message?.includes("FORBIDDEN")) {
      return fail("UNAUTHORIZED", "Sign in with an owner account to add bottles.", 401)
    }

    return fail("VALIDATION_ERROR", "Usable volume must be positive and cannot exceed original volume.", 422)
  }

  return ok(mapBottle(data), { status: 201 })
}
