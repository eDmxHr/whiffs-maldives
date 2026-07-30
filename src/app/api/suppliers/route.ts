import { requireAdmin } from "@/lib/auth"
import { collection, fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"
import { createSupplierSchema } from "@/features/inventory/schemas/bottles"

export async function GET() {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to view suppliers.", 401)
  }

  return collection(demoStore.listSuppliers())
}

export async function POST(request: Request) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to add suppliers.", 401)
  }

  const parsed = createSupplierSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Supplier details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  return ok(demoStore.createSupplier(parsed.data), { status: 201 })
}
