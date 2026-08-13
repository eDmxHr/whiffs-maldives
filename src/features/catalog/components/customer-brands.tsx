/* eslint-disable @next/next/no-img-element */

"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"
import { Container, Section } from "@/components/layouts/container"
import { Reveal } from "@/components/motion/reveal"
import { useFragrances } from "@/features/catalog/hooks/use-catalog"
import type { Brand, FragranceView } from "@/types/catalog"

function groupByBrand(fragrances: FragranceView[]) {
  const groups = new Map<string, { brand: Brand; fragrances: FragranceView[] }>()

  for (const fragrance of fragrances) {
    const existing = groups.get(fragrance.brand.id)

    if (existing) {
      existing.fragrances.push(fragrance)
    } else {
      groups.set(fragrance.brand.id, { brand: fragrance.brand, fragrances: [fragrance] })
    }
  }

  return Array.from(groups.values()).sort((a, b) => a.brand.name.localeCompare(b.brand.name))
}

export function CustomerBrands() {
  const fragrances = useFragrances(true)
  const brands = groupByBrand(fragrances.data ?? [])

  return (
    <Section bordered={false}>
      <Container className="py-16 md:py-20">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">Brands</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold md:text-5xl">Every house, one collection.</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
            From Middle Eastern houses to designer, niche, and high-end labels — every scent we carry, in one place.
          </p>
        </Reveal>

        {fragrances.isLoading ? (
          <p className="mt-16 text-sm text-muted-foreground">Loading brands...</p>
        ) : brands.length === 0 ? (
          <div className="mt-16 grid place-items-center rounded-2xl border border-dashed border-admin-champagne/50 px-6 py-20 text-center">
            <p className="font-heading text-2xl font-semibold">The first houses are arriving</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              We are adding the opening brands now — check back soon.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {brands.map((group, index) => (
              <Reveal delay={index === 0 ? 0 : index === 1 ? 150 : 300} key={group.brand.id}>
                <Link className="group block transition hover:-translate-y-0.5" href={`/brands/${group.brand.slug}`}>
                  <Card className="overflow-hidden border-border bg-card transition group-hover:shadow-lg">
                    {group.fragrances[0]?.heroImage ? (
                      <img
                        alt=""
                        className="aspect-4/3 w-full object-cover"
                        src={group.fragrances[0].heroImage.publicUrl}
                      />
                    ) : (
                      <div className="grid aspect-4/3 place-items-center bg-admin-reef">
                        <span className="font-heading text-4xl font-semibold text-white">{group.brand.name[0]}</span>
                      </div>
                    )}
                    <div className="p-5">
                      <h2 className="font-heading text-2xl font-semibold">{group.brand.name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {group.fragrances.length} fragrance{group.fragrances.length > 1 ? "s" : ""}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-admin-reef transition group-hover:gap-2.5">
                        View brand
                        <HugeiconsIcon aria-hidden="true" className="size-4" icon={ArrowRight01Icon} strokeWidth={2} />
                      </span>
                    </div>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}
