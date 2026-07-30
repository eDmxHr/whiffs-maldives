import { requireAdmin } from "@/lib/auth"
import { collection, fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"
import { createFragranceSchema } from "@/features/catalog/schemas/catalog"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const publishedOnly = url.searchParams.get("status") === "published"
  return collection(demoStore.listFragrances({ publishedOnly }))
}

export async function POST(request: Request) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to manage fragrances.", 401)
  }

  const parsed = createFragranceSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Fragrance details are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const result = demoStore.createFragrance(parsed.data)

  if ("error" in result) {
    return fail("DUPLICATE_SLUG", "A fragrance with this slug already exists.", 409)
  }

  return ok(result.data, { status: 201 })
}
