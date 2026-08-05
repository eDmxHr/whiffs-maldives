import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"
import { adjustBottleSchema } from "@/features/inventory/schemas/bottles"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to adjust inventory.", 401)
  }

  const { id } = await context.params
  const parsed = adjustBottleSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Adjustment details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const result = demoStore.adjustBottle(id, parsed.data)

  if ("error" in result) {
    return fail("NOT_FOUND", "Bottle was not found.", 404)
  }

  return ok(result.data)
}
