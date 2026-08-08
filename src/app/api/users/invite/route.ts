import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { mapAdminUser } from "@/lib/supabase/catalog-repository"
import { hasPermission } from "@/lib/permissions"
import { inviteUserSchema } from "@/features/users/schemas/users"

export async function POST(request: Request) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to invite users.", 401)
  }

  if (!hasPermission(admin.role, "users.manage")) {
    return fail("UNAUTHORIZED", "You do not have permission to manage users.", 403)
  }

  const parsed = inviteUserSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invite details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  let adminClient
  try {
    adminClient = createAdminClient()
  } catch {
    return fail("SERVER_ERROR", "Admin invites are not configured on this server.", 500)
  }

  const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: { name: parsed.data.name },
  })

  if (inviteError || !invited.user) {
    return fail("VALIDATION_ERROR", inviteError?.message ?? "Could not invite this user.", 422)
  }

  const supabase = await createClient()
  const { error: rpcError } = await supabase.rpc("set_user_role", {
    p_user_id: invited.user.id,
    p_role_name: parsed.data.role,
  })

  if (rpcError) {
    if (rpcError.message?.includes("FORBIDDEN")) {
      return fail("UNAUTHORIZED", "You do not have permission to manage users.", 403)
    }

    return fail("VALIDATION_ERROR", "Select a valid role.", 422)
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, name, is_active, user_roles(role:roles(name))")
    .eq("id", invited.user.id)
    .maybeSingle()

  const user = data ? mapAdminUser(data) : null

  if (!user) {
    return fail("VALIDATION_ERROR", "Could not load the invited user.", 422)
  }

  return ok(user, { status: 201 })
}
