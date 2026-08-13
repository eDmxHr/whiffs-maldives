"use client"

import Link from "next/link"

export interface PriceBucket {
  label: string
  min: number
  max: number
}

export interface FilterBrand {
  id: string
  name: string
}

export const genderFilterOptions = [
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Unisex", value: "unisex" },
]

export const priceBuckets: PriceBucket[] = [
  { label: "Under MVR 200", min: 0, max: 200 },
  { label: "MVR 200 – 400", min: 200, max: 400 },
  { label: "MVR 400 – 800", min: 400, max: 800 },
  { label: "MVR 800+", min: 800, max: Infinity },
]

interface FragranceFiltersProps {
  genderFilter: string | null
  selectedBuckets: string[]
  onToggleBucket: (label: string) => void
  brands: FilterBrand[]
  selectedBrandIds: string[]
  onToggleBrand: (id: string) => void
  hasActiveFilters: boolean
  onClearAll: () => void
}

export function FragranceFilters({
  genderFilter,
  selectedBuckets,
  onToggleBucket,
  brands,
  selectedBrandIds,
  onToggleBrand,
  hasActiveFilters,
  onClearAll,
}: FragranceFiltersProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">Gender</h2>
        <div className="mt-3 space-y-2">
          {genderFilterOptions.map((filter) => {
            const active = filter.value === genderFilter
            return (
              <Link
                key={filter.value}
                className="flex items-center gap-2 text-sm text-foreground"
                href={active ? "/fragrances" : `/fragrances?gender=${filter.value}`}
              >
                <input checked={active} className="size-4 accent-admin-reef" onChange={() => {}} type="checkbox" />
                {filter.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">Price</h2>
        <div className="mt-3 space-y-2">
          {priceBuckets.map((bucket) => (
            <label key={bucket.label} className="flex items-center gap-2 text-sm text-foreground">
              <input
                checked={selectedBuckets.includes(bucket.label)}
                className="size-4 accent-admin-reef"
                onChange={() => onToggleBucket(bucket.label)}
                type="checkbox"
              />
              {bucket.label}
            </label>
          ))}
        </div>
      </div>

      {brands.length ? (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">Brand</h2>
          <div className="mt-3 space-y-2">
            {brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  checked={selectedBrandIds.includes(brand.id)}
                  className="size-4 accent-admin-reef"
                  onChange={() => onToggleBrand(brand.id)}
                  type="checkbox"
                />
                {brand.name}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {hasActiveFilters ? (
        <button className="text-sm font-semibold text-admin-reef hover:underline" onClick={onClearAll} type="button">
          Clear all filters
        </button>
      ) : null}
    </div>
  )
}

export function fromPriceOf(fragrance: { offerings: { isActive: boolean; price: number }[] }) {
  const active = fragrance.offerings.filter((offering) => offering.isActive)
  return active.length ? Math.min(...active.map((offering) => offering.price)) : null
}
