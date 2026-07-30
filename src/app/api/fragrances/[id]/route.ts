import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"
import { createFragranceSchema } from "@/features/catalog/schemas/catalog"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const fragrance = demoStore.getFragrance(id)

  if (!fragrance) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  return ok(fragrance)
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to update fragrances.", 401)
  }

  const { id } = await context.params
  const parsed = createFragranceSchema.partial().safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Fragrance details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const fragrance = demoStore.updateFragrance(id, parsed.data)

  if (!fragrance) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  return ok(fragrance)
}
