import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { mapBottle } from "@/lib/supabase/catalog-repository"
import { adjustBottleSchema } from "@/features/inventory/schemas/bottles"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to adjust inventory.", 401)
  }

  const { id } = await context.params
  const parsed = adjustBottleSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Adjustment details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("adjust_bottle_volume", {
    p_bottle_id: id,
    p_quantity_ml: parsed.data.quantityMl,
    p_reason: parsed.data.reason,
  })

  if (error || !data) {
    if (error?.message?.includes("FORBIDDEN")) {
      return fail("UNAUTHORIZED", "Sign in with an owner account to adjust inventory.", 401)
    }

    return fail("NOT_FOUND", "Bottle was not found.", 404)
  }

  return ok(mapBottle(data))
}
