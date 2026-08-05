import { requireAdmin } from "@/lib/auth"
import { collection, fail } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { mapInventoryEvent } from "@/lib/supabase/catalog-repository"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to view the bottle ledger.", 401)
  }

  const { id } = await context.params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("inventory_events")
    .select("*")
    .eq("bottle_id", id)
    .order("created_at", { ascending: false })

  if (error || !data) {
    return collection([])
  }

  return collection(data.map(mapInventoryEvent))
}
