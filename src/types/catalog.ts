export interface Brand {
  id: string
  name: string
  slug: string
  description: string
  isActive: boolean
}

export interface FragranceImage {
  id: string
  fragranceId: string
  storagePath: string
  publicUrl: string
  position: number
}

export interface FragranceNote {
  id: string
  name: string
  category: string
  pyramidLevel: "top" | "heart" | "base"
  position: number
}

export interface Offering {
  id: string
  fragranceId: string
  name: string
  type: "decant"
  sizeMl: number
  price: number
  suggestedPrice: number
  isActive: boolean
}

export interface Supplier {
  id: string
  name: string
  phone: string
  email: string
  notes: string
  isActive: boolean
}

export interface Bottle {
  id: string
  fragranceId: string
  supplierId: string
  originalVolumeMl: number
  usableVolumeMl: number
  remainingVolumeMl: number
  /** Volume promised to payment-confirmed-but-not-yet-prepared orders. Available for new orders = remainingVolumeMl - committedVolumeMl. */
  committedVolumeMl: number
  purchasePrice: number
  purchaseDate: string
  receivedAt: string
  status: "available" | "low_volume" | "empty" | "archived"
  notes: string
}

export interface InventoryEvent {
  id: string
  bottleId: string
  type: "initial_stock" | "adjustment" | "reserved" | "fulfilled" | "returned"
  quantityMl: number
  balanceAfterMl: number
  reason: string
  createdAt: string
}

export interface Fragrance {
  id: string
  brandId: string
  name: string
  slug: string
  description: string
  concentration: string
  releaseYear?: number
  perfumer: string
  gender: string
  status: "draft" | "published" | "archived"
  isActive: boolean
  isFeatured: boolean
  isBestSeller: boolean
  createdAt: string
  images: FragranceImage[]
  notes: FragranceNote[]
  offerings: Offering[]
}

export interface FragranceView extends Fragrance {
  brand: Brand
  heroImage?: FragranceImage
  bottles: Bottle[]
}
