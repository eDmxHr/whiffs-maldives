import { requireAdmin } from "@/lib/auth"
import { collection, fail } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"
import { hasPermission } from "@/lib/permissions"

export async function GET() {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to view users.", 401)
  }

  if (!hasPermission(admin.role, "users.manage")) {
    return fail("UNAUTHORIZED", "You do not have permission to manage users.", 403)
  }

  return collection(demoStore.listUsers())
}
