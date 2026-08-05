import { requireAdmin } from "@/lib/auth"
import { collection, fail } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to view the bottle ledger.", 401)
  }

  const { id } = await context.params
  return collection(demoStore.listInventoryEvents(id))
}
