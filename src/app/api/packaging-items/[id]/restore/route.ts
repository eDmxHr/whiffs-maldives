import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { mapPackagingItem } from "@/lib/supabase/catalog-repository"

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to restore packaging items.", 401)
  }

  const { id } = await context.params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("packaging_items")
    .update({ is_active: true })
    .eq("id", id)
    .select("*")
    .single()

  if (error || !data) {
    return fail("NOT_FOUND", "Packaging item was not found.", 404)
  }

  return ok(mapPackagingItem(data))
}
