import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"
import { updateSettingsSchema } from "@/features/settings/schemas/settings"

export async function GET() {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to view settings.", 401)
  }

  return ok(demoStore.getSettings())
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to update settings.", 401)
  }

  const parsed = updateSettingsSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Settings values are invalid.", 422, parsed.error.flatten().fieldErrors)
  }

  return ok(demoStore.updateSettings(parsed.data))
}
