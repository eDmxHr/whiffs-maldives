import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"
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

  const user = demoStore.updateUserRole(id, parsed.data.role)

  if (!user) {
    return fail("NOT_FOUND", "User was not found.", 404)
  }

  return ok(user)
}
