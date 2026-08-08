import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { mapAdminUser } from "@/lib/supabase/catalog-repository"
import { hasPermission } from "@/lib/permissions"
import { updateUserRoleSchema } from "@/features/users/schemas/users"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to manage users.", 401)
  }

  if (!hasPermission(admin.role, "users.manage")) {
    return fail("UNAUTHORIZED", "You do not have permission to manage users.", 403)
  }

  const { id } = await context.params
  const parsed = updateUserRoleSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Select a valid role.", 422, parsed.error.flatten().fieldErrors)
  }

  const supabase = await createClient()
  const { error: rpcError } = await supabase.rpc("set_user_role", {
    p_user_id: id,
    p_role_name: parsed.data.role,
  })

  if (rpcError) {
    if (rpcError.message?.includes("FORBIDDEN")) {
      return fail("UNAUTHORIZED", "You do not have permission to manage users.", 403)
    }

    if (rpcError.message?.includes("NOT_FOUND")) {
      return fail("NOT_FOUND", "User was not found.", 404)
    }

    return fail("VALIDATION_ERROR", "Select a valid role.", 422)
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, name, is_active, user_roles(role:roles(name))")
    .eq("id", id)
    .maybeSingle()

  const user = data ? mapAdminUser(data) : null

  if (!user) {
    return fail("NOT_FOUND", "User was not found.", 404)
  }

  return ok(user)
}
