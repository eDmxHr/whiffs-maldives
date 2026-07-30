import { requireAdmin } from "@/lib/auth"
import { collection, fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"
import { upsertOfferingsSchema } from "@/features/catalog/schemas/catalog"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const fragrance = demoStore.getFragrance(id)

  if (!fragrance) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  return collection(fragrance.offerings)
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to manage offerings.", 401)
  }

  const { id } = await context.params
  const parsed = upsertOfferingsSchema.safeParse(await request.json())

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Offering prices are incomplete.", 422, parsed.error.flatten().fieldErrors)
  }

  const result = demoStore.upsertOfferings(id, parsed.data.offerings)

  if (!result) {
    return fail("NOT_FOUND", "Fragrance was not found.", 404)
  }

  if ("error" in result) {
    return fail("DUPLICATE_OFFERING_SIZE", "Each decant size can only appear once.", 409)
  }

  return ok(result.data)
}
