import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { mapPackagingItem } from "@/lib/supabase/catalog-repository"
import { updatePackagingItemSchema } from "@/features/packaging/schemas/packaging"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to update packaging items.", 401)
  }

  const { id } = await context.params
  const parsed = updatePackagingItemSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Packaging item details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("packaging_items")
    .update({
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.unit !== undefined && { unit: parsed.data.unit }),
      ...(parsed.data.unitCost !== undefined && { unit_cost: parsed.data.unitCost }),
      ...(parsed.data.quantity !== undefined && { quantity: parsed.data.quantity }),
      ...(parsed.data.minimumQuantity !== undefined && { minimum_quantity: parsed.data.minimumQuantity }),
      ...(parsed.data.decantSizeMl !== undefined && { decant_size_ml: parsed.data.decantSizeMl }),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle()

  if (error || !data) {
    return fail("NOT_FOUND", "Packaging item was not found.", 404)
  }

  return ok(mapPackagingItem(data))
}
