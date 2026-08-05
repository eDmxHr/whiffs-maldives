import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { fetchFragranceView } from "@/lib/supabase/catalog-repository"

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to archive fragrances.", 401)
  }

  const { id } = await context.params
  const supabase = await createClient()

  const { error } = await supabase.from("fragrances").update({ status: "archived" }).eq("id", id)

  if (error) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  const fragrance = await fetchFragranceView(supabase, id)

  if (!fragrance) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  return ok(fragrance)
}
