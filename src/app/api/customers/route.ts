import { requireAdmin } from "@/lib/auth"
import { collection, fail } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"

export async function GET() {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to view customers.", 401)
  }

  return collection(demoStore.listCustomers())
}
