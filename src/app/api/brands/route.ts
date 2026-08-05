import { requireAdmin } from "@/lib/auth"
import { collection, fail, ok } from "@/lib/api-response"
import { slugify } from "@/lib/slug"
import { createClient } from "@/lib/supabase/server"
import { mapBrand } from "@/lib/supabase/catalog-repository"
import { createBrandSchema } from "@/features/catalog/schemas/catalog"

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("brands").select("*").order("name")

  if (error || !data) {
    return collection([])
  }

  return collection(data.map(mapBrand))
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

  const supabase = await createClient()
  const slug = slugify(parsed.data.name)

  const { data, error } = await supabase
    .from("brands")
    .insert({ name: parsed.data.name, slug, description: parsed.data.description || null })
    .select("*")
    .single()

  if (error) {
    if (error.code === "23505") {
      return fail("DUPLICATE_SLUG", "A brand with this slug already exists.", 409)
    }

    return fail("VALIDATION_ERROR", "Could not create the brand.", 422)
  }

  return ok(mapBrand(data), { status: 201 })
}
