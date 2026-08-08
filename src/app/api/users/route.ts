import { requireAdmin } from "@/lib/auth"
import { collection, fail } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { mapAdminUser } from "@/lib/supabase/catalog-repository"
import { hasPermission } from "@/lib/permissions"

export async function GET() {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to view users.", 401)
  }

  if (!hasPermission(admin.role, "users.manage")) {
    return fail("UNAUTHORIZED", "You do not have permission to manage users.", 403)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, is_active, user_roles(role:roles(name))")
    .eq("is_active", true)
    .order("name")

  if (error || !data) {
    return collection([])
  }

  const users = data
    .map((row) => mapAdminUser(row))
    .filter((user): user is NonNullable<typeof user> => user !== null)

  return collection(users)
}
