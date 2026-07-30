import { requireAdmin } from "@/lib/auth"
import { collection, fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"
import { createBrandSchema } from "@/features/catalog/schemas/catalog"

export async function GET() {
  return collection(demoStore.listBrands())
}

export async function POST(request: Request) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to manage brands.", 401)
  }

  const parsed = createBrandSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Brand details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const result = demoStore.createBrand(parsed.data)

  if ("error" in result) {
    return fail("DUPLICATE_SLUG", "A brand with this slug already exists.", 409)
  }

  return ok(result.data, { status: 201 })
}
