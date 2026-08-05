import { requireAdmin } from "@/lib/auth"
import { collection, fail, ok } from "@/lib/api-response"
import { slugify } from "@/lib/slug"
import { createClient } from "@/lib/supabase/server"
import { fetchFragranceView, fetchFragranceViews, findOrCreateNotes } from "@/lib/supabase/catalog-repository"
import { createFragranceSchema } from "@/features/catalog/schemas/catalog"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const publishedOnly = url.searchParams.get("status") === "published"
  const supabase = await createClient()
  const views = await fetchFragranceViews(supabase, { publishedOnly })

  return collection(views)
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

  const supabase = await createClient()

  const { data: brand } = await supabase.from("brands").select("name").eq("id", parsed.data.brandId).maybeSingle()
  const baseSlug = `${brand?.name ?? ""} ${parsed.data.name}`
  const slug = slugify(baseSlug)

  const { data: created, error } = await supabase
    .from("fragrances")
    .insert({
      brand_id: parsed.data.brandId,
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      concentration: parsed.data.concentration || null,
      release_year: parsed.data.releaseYear ?? null,
      perfumer: parsed.data.perfumer || null,
      gender: parsed.data.gender || null,
    })
    .select("id")
    .single()

  if (error || !created) {
    if (error?.code === "23505") {
      return fail("DUPLICATE_SLUG", "A fragrance with this slug already exists.", 409)
    }

    return fail("VALIDATION_ERROR", "Could not create the fragrance.", 422)
  }

  if (parsed.data.notes.length) {
    await findOrCreateNotes(supabase, created.id, parsed.data.notes)
  }

  const view = await fetchFragranceView(supabase, created.id)

  return ok(view, { status: 201 })
}
