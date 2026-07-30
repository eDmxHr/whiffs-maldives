import { requireAdmin } from "@/lib/auth"
import { collection, fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"
import { imageSchema } from "@/features/catalog/schemas/catalog"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const fragrance = demoStore.getFragrance(id)

  if (!fragrance) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  return collection(fragrance.images)
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to manage fragrance images.", 401)
  }

  const { id } = await context.params
  const parsed = imageSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Add a valid image URL for the local slice.", 422, parsed.error.flatten().fieldErrors)
  }

  const image = demoStore.addImage(id, parsed.data)

  if (!image) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  return ok(image, { status: 201 })
}
