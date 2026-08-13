"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { FilterIcon } from "@hugeicons/core-free-icons"

import { Container, Section } from "@/components/layouts/container"
import { Reveal } from "@/components/motion/reveal"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { FragranceCard } from "@/features/catalog/components/fragrance-card"
import { FragranceFilters, fromPriceOf, priceBuckets } from "@/features/catalog/components/fragrance-filters"
import { useFragrances } from "@/features/catalog/hooks/use-catalog"

const viewCopy: Record<string, { eyebrow: string; title: string; description: string }> = {
  new: {
    eyebrow: "New arrivals",
    title: "The latest additions",
    description: "Just decanted and ready to try — hand-poured to order and delivered across the Maldives.",
  },
  "best-sellers": {
    eyebrow: "Best sellers",
    title: "The scents everyone reaches for",
    description: "The decants our customers keep coming back for.",
  },
}

export function CustomerFragrancesIndex() {
  const fragrances = useFragrances(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const genderFilter = searchParams.get("gender")
  const view = searchParams.get("view")
  const copy = view ? viewCopy[view] : undefined

  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([])
  const [selectedBuckets, setSelectedBuckets] = useState<string[]>([])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const brands = useMemo(() => {
    const byId = new Map<string, string>()
    for (const fragrance of fragrances.data ?? []) {
      byId.set(fragrance.brand.id, fragrance.brand.name)
    }
    return [...byId.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [fragrances.data])

  let visibleFragrances = genderFilter
    ? fragrances.data?.filter((fragrance) => fragrance.gender?.toLowerCase() === genderFilter.toLowerCase())
    : fragrances.data

  if (view === "best-sellers") {
    visibleFragrances = visibleFragrances?.filter((fragrance) => fragrance.isBestSeller)
  } else if (view === "new") {
    visibleFragrances = visibleFragrances
      ? [...visibleFragrances].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      : visibleFragrances
  }

  if (selectedBrandIds.length) {
    visibleFragrances = visibleFragrances?.filter((fragrance) => selectedBrandIds.includes(fragrance.brand.id))
  }

  if (selectedBuckets.length) {
    const buckets = priceBuckets.filter((bucket) => selectedBuckets.includes(bucket.label))
    visibleFragrances = visibleFragrances?.filter((fragrance) => {
      const price = fromPriceOf(fragrance)
      if (price === null) return false
      return buckets.some((bucket) => price >= bucket.min && price < bucket.max)
    })
  }

  const activeFilterCount = (genderFilter ? 1 : 0) + selectedBrandIds.length + selectedBuckets.length
  const hasActiveFilters = Boolean(activeFilterCount || view)

  function toggleBrand(id: string) {
    setSelectedBrandIds((current) =>
      current.includes(id) ? current.filter((brandId) => brandId !== id) : [...current, id]
    )
  }

  function toggleBucket(label: string) {
    setSelectedBuckets((current) =>
      current.includes(label) ? current.filter((bucketLabel) => bucketLabel !== label) : [...current, label]
    )
  }

  function clearAllFilters() {
    setSelectedBrandIds([])
    setSelectedBuckets([])
    setMobileFiltersOpen(false)
    router.push("/fragrances")
  }

  const filterProps = {
    genderFilter,
    selectedBuckets,
    onToggleBucket: toggleBucket,
    brands,
    selectedBrandIds,
    onToggleBrand: toggleBrand,
    hasActiveFilters,
    onClearAll: clearAllFilters,
  }

  return (
    <Section bordered={false}>
      <Container className="py-16 md:py-20">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">{copy?.eyebrow ?? "Fragrances"}</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold md:text-5xl">{copy?.title ?? "Every scent, ready to try"}</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
            {copy?.description ?? "Hand-poured to order and delivered across the Maldives."}
          </p>
        </Reveal>

        <div className="mt-8 md:hidden">
          <Sheet onOpenChange={setMobileFiltersOpen} open={mobileFiltersOpen}>
            <Button
              className="w-full justify-center gap-2"
              onClick={() => setMobileFiltersOpen(true)}
              variant="outline"
            >
              <HugeiconsIcon aria-hidden="true" className="size-4" icon={FilterIcon} strokeWidth={1.5} />
              Filters
              {activeFilterCount ? (
                <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-admin-reef text-xs font-semibold text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>
            <SheetContent className="max-h-[80vh] overflow-y-auto" side="bottom">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">
                <FragranceFilters {...filterProps} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-[220px_1fr]">
          <aside className="hidden md:block">
            <FragranceFilters {...filterProps} />
          </aside>

          <div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleFragrances?.map((fragrance, index) => (
                <Reveal delay={index === 0 ? 0 : index === 1 ? 150 : 300} key={fragrance.id}>
                  <FragranceCard fragrance={fragrance} />
                </Reveal>
              ))}
            </div>

            {visibleFragrances && visibleFragrances.length === 0 ? (
              <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-admin-champagne/50 px-6 py-20 text-center">
                <div aria-hidden="true" className="flex items-end gap-2 opacity-70">
                  <div className="h-10 w-4 rounded-sm bg-admin-reef/25" />
                  <div className="h-14 w-5 rounded-sm bg-admin-reef/40" />
                  <div className="h-12 w-4 rounded-sm bg-admin-reef/25" />
                </div>
                <p className="mt-6 font-heading text-2xl font-semibold">
                  {hasActiveFilters ? "Nothing here yet" : "The first pours are on their way"}
                </p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  {hasActiveFilters
                    ? "We don't have a match for this filter yet — try clearing a filter or browse everything."
                    : "We are decanting the opening collection now — check back soon."}
                </p>
                {hasActiveFilters ? (
                  <button
                    className="mt-4 text-sm font-semibold text-admin-reef hover:underline"
                    onClick={clearAllFilters}
                    type="button"
                  >
                    Clear all filters
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  )
}
