import { requireAdmin } from "@/lib/auth"
import { collection, fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"
import { createBottleSchema } from "@/features/inventory/schemas/bottles"

export async function GET() {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to view bottles.", 401)
  }

  return collection(demoStore.listBottles())
}

export async function POST(request: Request) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to add bottles.", 401)
  }

  const parsed = createBottleSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Bottle details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const result = demoStore.createBottle(parsed.data)

  if ("error" in result) {
    return fail("VALIDATION_ERROR", "Usable volume must be positive and cannot exceed original volume.", 422)
  }

  return ok(result.data, { status: 201 })
}
