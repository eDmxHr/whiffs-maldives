import { calculateDecantPrice, DEFAULT_DECANT_SIZES } from "@/lib/pricing"
import { slugify } from "@/lib/slug"
import type { Bottle, Brand, Fragrance, FragranceImage, FragranceView, InventoryEvent, Offering, Supplier } from "@/types/catalog"

type CreateBrandInput = Pick<Brand, "name" | "description">
type CreateFragranceInput = Omit<Fragrance, "id" | "slug" | "status" | "isActive" | "images" | "offerings"> & {
  slug?: string
}
type CreateBottleInput = Omit<Bottle, "id" | "remainingVolumeMl" | "status" | "receivedAt">

const now = () => new Date().toISOString()
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`

const brands: Brand[] = [
  {
    id: "brand_dior",
    name: "Dior",
    slug: "dior",
    description: "French fragrance house with polished designer signatures.",
    isActive: true,
  },
]

const fragrances: Fragrance[] = [
  {
    id: "fragrance_sauvage",
    brandId: "brand_dior",
    name: "Sauvage Eau de Parfum",
    slug: "dior-sauvage-eau-de-parfum",
    description: "A crisp aromatic amber profile built for warm evenings and polished daily wear.",
    concentration: "Eau de Parfum",
    releaseYear: 2018,
    perfumer: "Francois Demachy",
    gender: "Masculine",
    status: "published",
    isActive: true,
    images: [
      {
        id: "image_sauvage_1",
        fragranceId: "fragrance_sauvage",
        storagePath: "demo/sauvage-1",
        publicUrl:
          "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80",
        position: 1,
      },
    ],
    notes: [
      { id: "note_bergamot", name: "Bergamot", category: "citrus", pyramidLevel: "top", position: 1 },
      { id: "note_lavender", name: "Lavender", category: "aromatic", pyramidLevel: "heart", position: 1 },
      { id: "note_amber", name: "Ambroxan", category: "amber", pyramidLevel: "base", position: 1 },
    ],
    offerings: [],
  },
]

const suppliers: Supplier[] = [
  {
    id: "supplier_default",
    name: "Initial supplier",
    phone: "",
    email: "",
    notes: "Local-first placeholder supplier.",
    isActive: true,
  },
]

const bottles: Bottle[] = [
  {
    id: "bottle_sauvage_1",
    fragranceId: "fragrance_sauvage",
    supplierId: "supplier_default",
    originalVolumeMl: 100,
    usableVolumeMl: 96,
    remainingVolumeMl: 96,
    purchasePrice: 2800,
    purchaseDate: new Date().toISOString().slice(0, 10),
    receivedAt: now(),
    status: "available",
    notes: "Seed bottle for vertical-slice validation.",
  },
]

const inventoryEvents: InventoryEvent[] = [
  {
    id: "event_sauvage_1",
    bottleId: "bottle_sauvage_1",
    type: "initial_stock",
    quantityMl: 96,
    balanceAfterMl: 96,
    reason: "Initial bottle entry",
    createdAt: now(),
  },
]

function seedOfferings() {
  const fragrance = fragrances[0]
  const bottle = bottles[0]

  fragrance.offerings = DEFAULT_DECANT_SIZES.map((sizeMl) => {
    const result = calculateDecantPrice({
      bottleCost: bottle.purchasePrice,
      usableVolumeMl: bottle.usableVolumeMl,
      decantSizeMl: sizeMl,
      packagingCost: 12,
      operationsBuffer: 5,
    })

    return {
      id: `offering_${sizeMl}ml`,
      fragranceId: fragrance.id,
      name: `${sizeMl}ml`,
      type: "decant",
      sizeMl,
      price: result.finalPrice,
      suggestedPrice: result.finalPrice,
      isActive: true,
    }
  })
}

seedOfferings()

function toView(fragrance: Fragrance): FragranceView {
  const brand = brands.find((item) => item.id === fragrance.brandId)

  if (!brand) {
    throw new Error("Brand not found.")
  }

  const sortedImages = [...fragrance.images].sort((a, b) => a.position - b.position)

  return {
    ...fragrance,
    brand,
    images: sortedImages,
    heroImage: sortedImages[0],
    bottles: bottles.filter((bottle) => bottle.fragranceId === fragrance.id),
  }
}

export const demoStore = {
  listBrands() {
    return brands
  },
  createBrand(input: CreateBrandInput) {
    const slug = slugify(input.name)

    if (brands.some((brand) => brand.slug === slug)) {
      return { error: "DUPLICATE_SLUG" as const }
    }

    const brand: Brand = {
      id: id("brand"),
      name: input.name,
      slug,
      description: input.description ?? "",
      isActive: true,
    }

    brands.unshift(brand)
    return { data: brand }
  },
  listFragrances({ publishedOnly = false } = {}) {
    return fragrances.filter((fragrance) => !publishedOnly || fragrance.status === "published").map(toView)
  },
  getFragrance(idOrSlug: string) {
    const fragrance = fragrances.find((item) => item.id === idOrSlug || item.slug === idOrSlug)
    return fragrance ? toView(fragrance) : null
  },
  createFragrance(input: CreateFragranceInput) {
    const baseSlug = input.slug || `${brands.find((brand) => brand.id === input.brandId)?.name ?? ""} ${input.name}`
    const slug = slugify(baseSlug)

    if (fragrances.some((fragrance) => fragrance.slug === slug)) {
      return { error: "DUPLICATE_SLUG" as const }
    }

    const fragrance: Fragrance = {
      id: id("fragrance"),
      brandId: input.brandId,
      name: input.name,
      slug,
      description: input.description,
      concentration: input.concentration,
      releaseYear: input.releaseYear,
      perfumer: input.perfumer,
      gender: input.gender,
      status: "draft",
      isActive: true,
      images: [],
      notes: input.notes,
      offerings: [],
    }

    fragrances.unshift(fragrance)
    return { data: toView(fragrance) }
  },
  updateFragrance(fragranceId: string, input: Partial<CreateFragranceInput>) {
    const fragrance = fragrances.find((item) => item.id === fragranceId)

    if (!fragrance) {
      return null
    }

    Object.assign(fragrance, input)
    return toView(fragrance)
  },
  addImage(fragranceId: string, input: { publicUrl: string; storagePath?: string }) {
    const fragrance = fragrances.find((item) => item.id === fragranceId)

    if (!fragrance) {
      return null
    }

    const image: FragranceImage = {
      id: id("image"),
      fragranceId,
      storagePath: input.storagePath ?? input.publicUrl,
      publicUrl: input.publicUrl,
      position: fragrance.images.length + 1,
    }

    fragrance.images.push(image)
    return image
  },
  reorderImages(fragranceId: string, imageIds: string[]) {
    const fragrance = fragrances.find((item) => item.id === fragranceId)

    if (!fragrance) {
      return null
    }

    fragrance.images = imageIds
      .map((imageId, index) => {
        const image = fragrance.images.find((item) => item.id === imageId)
        return image ? { ...image, position: index + 1 } : null
      })
      .filter((image): image is FragranceImage => Boolean(image))

    return fragrance.images
  },
  deleteImage(fragranceId: string, imageId: string) {
    const fragrance = fragrances.find((item) => item.id === fragranceId)

    if (!fragrance) {
      return false
    }

    fragrance.images = fragrance.images
      .filter((image) => image.id !== imageId)
      .map((image, index) => ({ ...image, position: index + 1 }))
    return true
  },
  upsertOfferings(fragranceId: string, inputs: Array<Pick<Offering, "sizeMl" | "price" | "suggestedPrice" | "isActive">>) {
    const fragrance = fragrances.find((item) => item.id === fragranceId)

    if (!fragrance) {
      return null
    }

    const uniqueSizes = new Set(inputs.map((input) => input.sizeMl))
    if (uniqueSizes.size !== inputs.length) {
      return { error: "DUPLICATE_OFFERING_SIZE" as const }
    }

    fragrance.offerings = inputs.map((input) => ({
      id: fragrance.offerings.find((offering) => offering.sizeMl === input.sizeMl)?.id ?? id("offering"),
      fragranceId,
      name: `${input.sizeMl}ml`,
      type: "decant",
      sizeMl: input.sizeMl,
      price: input.price,
      suggestedPrice: input.suggestedPrice,
      isActive: input.isActive,
    }))

    return { data: fragrance.offerings }
  },
  publishFragrance(fragranceId: string) {
    const fragrance = fragrances.find((item) => item.id === fragranceId)

    if (!fragrance) {
      return { error: "NOT_FOUND" as const }
    }

    if (!fragrance.name || !fragrance.brandId || !fragrance.description) {
      return { error: "INSUFFICIENT_PUBLISH_DATA" as const }
    }

    if (!fragrance.images.length || !fragrance.offerings.some((offering) => offering.isActive)) {
      return { error: "INVALID_PUBLISH_STATE" as const }
    }

    fragrance.status = "published"
    return { data: toView(fragrance) }
  },
  listSuppliers() {
    return suppliers
  },
  createSupplier(input: Omit<Supplier, "id" | "isActive">) {
    const supplier: Supplier = {
      id: id("supplier"),
      ...input,
      isActive: true,
    }
    suppliers.unshift(supplier)
    return supplier
  },
  listBottles() {
    return bottles
  },
  createBottle(input: CreateBottleInput) {
    if (input.usableVolumeMl > input.originalVolumeMl || input.usableVolumeMl <= 0) {
      return { error: "VALIDATION_ERROR" as const }
    }

    const bottle: Bottle = {
      id: id("bottle"),
      ...input,
      remainingVolumeMl: input.usableVolumeMl,
      receivedAt: now(),
      status: "available",
    }

    bottles.unshift(bottle)
    inventoryEvents.unshift({
      id: id("event"),
      bottleId: bottle.id,
      type: "initial_stock",
      quantityMl: bottle.usableVolumeMl,
      balanceAfterMl: bottle.usableVolumeMl,
      reason: "Initial bottle entry",
      createdAt: now(),
    })

    return { data: bottle }
  },
}
