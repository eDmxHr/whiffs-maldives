import type { SupabaseClient } from "@supabase/supabase-js"

import { slugify } from "@/lib/slug"
import type {
  Bottle,
  Brand,
  Fragrance,
  FragranceImage,
  FragranceNote,
  FragranceView,
  InventoryEvent,
  Offering,
  Supplier,
} from "@/types/catalog"
import type { PackagingItem } from "@/types/packaging"
import type { AdminUser } from "@/types/users"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: string) {
  return UUID_RE.test(value)
}

export function mapBrand(row: Record<string, unknown>): Brand {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) ?? "",
    isActive: row.is_active as boolean,
  }
}

export function mapFragranceImage(row: Record<string, unknown>): FragranceImage {
  return {
    id: row.id as string,
    fragranceId: row.fragrance_id as string,
    storagePath: row.storage_path as string,
    publicUrl: (row.public_url as string) ?? "",
    position: row.position as number,
  }
}

export function mapOffering(row: Record<string, unknown>): Offering {
  return {
    id: row.id as string,
    fragranceId: row.fragrance_id as string,
    name: row.name as string,
    type: "decant",
    sizeMl: Number(row.size_ml),
    price: Number(row.price),
    suggestedPrice: Number(row.suggested_price ?? 0),
    isActive: row.is_active as boolean,
  }
}

export function mapSupplier(row: Record<string, unknown>): Supplier {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: (row.phone as string) ?? "",
    email: (row.email as string) ?? "",
    notes: (row.notes as string) ?? "",
    isActive: row.is_active as boolean,
  }
}

export function mapBottle(row: Record<string, unknown>): Bottle {
  return {
    id: row.id as string,
    fragranceId: row.fragrance_id as string,
    supplierId: (row.supplier_id as string) ?? "",
    originalVolumeMl: Number(row.original_volume_ml),
    usableVolumeMl: Number(row.usable_volume_ml),
    remainingVolumeMl: Number(row.remaining_volume_ml),
    committedVolumeMl: Number(row.committed_volume_ml ?? 0),
    purchasePrice: Number(row.purchase_price),
    purchaseDate: (row.purchase_date as string) ?? "",
    receivedAt: row.received_at as string,
    status: row.status as Bottle["status"],
    notes: (row.notes as string) ?? "",
  }
}

export function mapPackagingItem(row: Record<string, unknown>): PackagingItem {
  return {
    id: row.id as string,
    name: row.name as string,
    unit: row.unit as string,
    unitCost: Number(row.unit_cost),
    quantity: Number(row.quantity),
    minimumQuantity: Number(row.minimum_quantity),
    isActive: row.is_active as boolean,
    decantSizeMl: row.decant_size_ml === null || row.decant_size_ml === undefined ? null : Number(row.decant_size_ml),
  }
}

// row is a `profiles` row with a nested `user_roles(role:roles(name))` select. Returns null for
// any profile with no assigned role, mirroring how get_my_context() treats an unassigned user as
// having no session -- the route filters these out rather than guessing a default role.
export function mapAdminUser(row: Record<string, unknown>): AdminUser | null {
  const userRoles = (row.user_roles as Array<{ role: { name: string } | null } | null> | null) ?? []
  const roleName = userRoles[0]?.role?.name

  if (!roleName) {
    return null
  }

  return {
    id: row.id as string,
    name: (row.name as string) ?? "",
    role: roleName as AdminUser["role"],
  }
}

export function mapInventoryEvent(row: Record<string, unknown>): InventoryEvent {
  return {
    id: row.id as string,
    bottleId: row.bottle_id as string,
    type: row.type as InventoryEvent["type"],
    quantityMl: Number(row.quantity_ml),
    balanceAfterMl: Number(row.balance_after_ml),
    reason: (row.reason as string) ?? "",
    createdAt: row.created_at as string,
  }
}

function mapFragranceBase(row: Record<string, unknown>): Fragrance {
  return {
    id: row.id as string,
    brandId: row.brand_id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) ?? "",
    concentration: (row.concentration as string) ?? "",
    releaseYear: (row.release_year as number | null) ?? undefined,
    perfumer: (row.perfumer as string) ?? "",
    gender: (row.gender as string) ?? "",
    status: row.status as Fragrance["status"],
    isActive: row.is_active as boolean,
    isFeatured: (row.is_featured as boolean) ?? false,
    isBestSeller: (row.is_best_seller as boolean) ?? false,
    createdAt: row.created_at as string,
    images: [],
    notes: [],
    offerings: [],
  }
}

const FRAGRANCE_VIEW_SELECT = `
  *,
  brand:brands(*),
  images:fragrance_images(*),
  fragrance_notes(pyramid_level, position, note:notes(*)),
  offerings(*),
  bottles(*)
`

export async function fetchFragranceView(
  supabase: SupabaseClient,
  idOrSlug: string
): Promise<FragranceView | null> {
  const { data, error } = await supabase
    .from("fragrances")
    .select(FRAGRANCE_VIEW_SELECT)
    .eq(isUuid(idOrSlug) ? "id" : "slug", idOrSlug)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return mapFragranceRow(data)
}

export async function fetchFragranceViews(
  supabase: SupabaseClient,
  options: { publishedOnly?: boolean } = {}
): Promise<FragranceView[]> {
  let query = supabase.from("fragrances").select(FRAGRANCE_VIEW_SELECT)

  if (options.publishedOnly) {
    query = query.eq("status", "published").eq("is_active", true)
  }

  const { data, error } = await query

  if (error || !data) {
    return []
  }

  return data.map(mapFragranceRow)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFragranceRow(row: any): FragranceView {
  const base = mapFragranceBase(row)
  const sortedImages = [...(row.images ?? [])]
    .map(mapFragranceImage)
    .sort((a, b) => a.position - b.position)

  const notes: FragranceNote[] = (row.fragrance_notes ?? [])
    .filter((entry: Record<string, unknown>) => Boolean(entry.note))
    .map((entry: Record<string, unknown>) => {
      const note = entry.note as Record<string, unknown>
      return {
        id: note.id as string,
        name: note.name as string,
        category: (note.category as string) ?? "",
        pyramidLevel: entry.pyramid_level as FragranceNote["pyramidLevel"],
        position: entry.position as number,
      }
    })
    .sort((a: FragranceNote, b: FragranceNote) => a.position - b.position)

  return {
    ...base,
    brand: mapBrand(row.brand),
    images: sortedImages,
    heroImage: sortedImages[0],
    notes,
    offerings: (row.offerings ?? []).map(mapOffering),
    bottles: (row.bottles ?? []).map(mapBottle),
  }
}

type NoteInput = { name: string; category?: string; pyramidLevel: "top" | "heart" | "base"; position: number }

export async function findOrCreateNotes(supabase: SupabaseClient, fragranceId: string, notes: NoteInput[]) {
  const noteIds: Array<{ noteId: string; pyramidLevel: string; position: number }> = []

  for (const note of notes) {
    const slug = slugify(note.name)
    const { data: existing } = await supabase.from("notes").select("id").eq("slug", slug).maybeSingle()

    let noteId = existing?.id as string | undefined

    if (!noteId) {
      const { data: created, error } = await supabase
        .from("notes")
        .insert({ name: note.name, slug, category: note.category || null })
        .select("id")
        .single()

      if (error || !created) {
        continue
      }

      noteId = created.id as string
    }

    noteIds.push({ noteId, pyramidLevel: note.pyramidLevel, position: note.position })
  }

  await supabase.from("fragrance_notes").delete().eq("fragrance_id", fragranceId)

  if (noteIds.length) {
    await supabase.from("fragrance_notes").insert(
      noteIds.map((entry) => ({
        fragrance_id: fragranceId,
        note_id: entry.noteId,
        pyramid_level: entry.pyramidLevel,
        position: entry.position,
      }))
    )
  }
}
