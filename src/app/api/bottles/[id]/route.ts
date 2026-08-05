import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"
import { updateBottleSchema } from "@/features/inventory/schemas/bottles"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const bottle = demoStore.getBottle(id)

  if (!bottle) {
    return fail("NOT_FOUND", "Bottle was not found.", 404)
  }

  return ok(bottle)
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to update bottles.", 401)
  }

  const { id } = await context.params
  const parsed = updateBottleSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Bottle details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const result = demoStore.updateBottle(id, parsed.data)

  if (!result) {
    return fail("NOT_FOUND", "Bottle was not found.", 404)
  }

  if ("error" in result) {
    return fail("VALIDATION_ERROR", "Usable volume must be positive and cannot exceed original volume.", 422)
  }

  return ok(result.data)
}
