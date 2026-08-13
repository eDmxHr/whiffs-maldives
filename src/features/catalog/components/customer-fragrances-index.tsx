/* eslint-disable @next/next/no-img-element */

"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"
import { Container, Section } from "@/components/layouts/container"
import { Reveal } from "@/components/motion/reveal"
import { useFragrances } from "@/features/catalog/hooks/use-catalog"
import { cn } from "@/lib/utils"

const filters = [
  { label: "All", value: null },
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Unisex", value: "unisex" },
]

export function CustomerFragrancesIndex() {
  const fragrances = useFragrances(true)
  const searchParams = useSearchParams()
  const genderFilter = searchParams.get("gender")

  const visibleFragrances = genderFilter
    ? fragrances.data?.filter((fragrance) => fragrance.gender?.toLowerCase() === genderFilter.toLowerCase())
    : fragrances.data

  return (
    <Section bordered={false}>
      <Container className="py-16 md:py-20">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">Fragrances</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold md:text-5xl">Every scent, ready to try</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
            Hand-poured to order and delivered across the Maldives.
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

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {visibleFragrances?.map((fragrance, index) => (
            <Reveal delay={index === 0 ? 0 : index === 1 ? 150 : 300} key={fragrance.id}>
              <Link href={`/fragrances/${fragrance.slug}`} className="group block transition hover:-translate-y-0.5">
                <Card className="overflow-hidden border-border bg-card transition group-hover:shadow-lg">
                  {fragrance.heroImage ? (
                    <img className="aspect-4/3 w-full object-cover" src={fragrance.heroImage.publicUrl} alt="" />
                  ) : (
                    <div className="aspect-4/3 bg-admin-reef" />
                  )}
                  <div className="p-5">
                    <div className="text-sm text-admin-champagne-deep">{fragrance.brand.name}</div>
                    <h3 className="mt-1 font-heading text-2xl font-semibold">{fragrance.name}</h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{fragrance.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-admin-reef transition group-hover:gap-2.5">
                      Details
                      <HugeiconsIcon aria-hidden="true" className="size-4" icon={ArrowRight01Icon} strokeWidth={2} />
                    </span>
                  </div>
                </Card>
              </Link>
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
              {genderFilter ? "Nothing here yet" : "The first pours are on their way"}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {genderFilter
                ? "We don't have a match for this filter yet — check back soon or browse everything."
                : "We are decanting the opening collection now — check back soon."}
            </p>
          </div>
        ) : null}
      </Container>
    </Section>
  )
}
