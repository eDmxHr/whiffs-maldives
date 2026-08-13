"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Container, Section } from "@/components/layouts/container"
import { Reveal } from "@/components/motion/reveal"
import { FragranceCard } from "@/features/catalog/components/fragrance-card"
import { useFragrances } from "@/features/catalog/hooks/use-catalog"
import { cn } from "@/lib/utils"

const filters = [
  { label: "All", value: null },
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Unisex", value: "unisex" },
]

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
  const searchParams = useSearchParams()
  const genderFilter = searchParams.get("gender")
  const view = searchParams.get("view")
  const copy = view ? viewCopy[view] : undefined

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

  return (
    <Section bordered={false}>
      <Container className="py-16 md:py-20">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">{copy?.eyebrow ?? "Fragrances"}</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold md:text-5xl">{copy?.title ?? "Every scent, ready to try"}</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
            {copy?.description ?? "Hand-poured to order and delivered across the Maldives."}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {filters.map((filter) => {
              const active = filter.value === genderFilter || (filter.value === null && !genderFilter)

              return (
                <Link
                  key={filter.label}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                    active
                      ? "border-admin-reef bg-admin-reef text-white"
                      : "border-border bg-card text-foreground hover:border-admin-reef/50"
                  )}
                  href={filter.value ? `/fragrances?gender=${filter.value}` : "/fragrances"}
                >
                  {filter.label}
                </Link>
              )
            })}
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3 xl:grid-cols-4">
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
              {genderFilter || view ? "Nothing here yet" : "The first pours are on their way"}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {genderFilter || view
                ? "We don't have a match for this filter yet — check back soon or browse everything."
                : "We are decanting the opening collection now — check back soon."}
            </p>
          </div>
        ) : null}
      </Container>
    </Section>
  )
}
