import { requireAdmin } from "@/lib/auth"
import { collection, fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"
import { createPackagingItemSchema } from "@/features/packaging/schemas/packaging"

export async function GET() {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to view packaging items.", 401)
  }

  return collection(demoStore.listPackagingItems())
}

export async function POST(request: Request) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to add packaging items.", 401)
  }

  const parsed = createPackagingItemSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Packaging item details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  return ok(demoStore.createPackagingItem(parsed.data), { status: 201 })
}
