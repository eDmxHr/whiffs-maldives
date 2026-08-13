/* eslint-disable @next/next/no-img-element */

"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"
import { Container, Section } from "@/components/layouts/container"
import { Reveal } from "@/components/motion/reveal"
import { useFragrances } from "@/features/catalog/hooks/use-catalog"

export function CustomerBrandDetail({ slug }: { slug: string }) {
  const fragrances = useFragrances(true)
  const brandFragrances = fragrances.data?.filter((fragrance) => fragrance.brand.slug === slug) ?? []
  const brand = brandFragrances[0]?.brand

  if (fragrances.isLoading) {
    return (
      <Section bordered={false}>
        <Container className="py-16">Loading brand...</Container>
      </Section>
    )
  }

  if (!brand) {
    return (
      <Section bordered={false}>
        <Container className="py-16 text-center">
          <h1 className="font-heading text-3xl font-semibold">We couldn&apos;t find that brand</h1>
          <Link className="mt-4 inline-block text-sm font-semibold text-admin-reef" href="/brands">
            Back to brands
          </Link>
        </Container>
      </Section>
    )
  }

  return (
    <Section bordered={false}>
      <Container className="py-16 md:py-20">
        <Reveal>
          <Link className="text-sm text-admin-champagne-deep transition hover:underline" href="/brands">
            Back to brands
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-admin-champagne">Brand</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold md:text-5xl">{brand.name}</h1>
          {brand.description ? (
            <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">{brand.description}</p>
          ) : null}
          <p className="mt-2 text-sm text-muted-foreground">
            {brandFragrances.length} fragrance{brandFragrances.length > 1 ? "s" : ""} in the collection
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {brandFragrances.map((fragrance, index) => (
            <Reveal delay={index === 0 ? 0 : index === 1 ? 150 : 300} key={fragrance.id}>
              <Link href={`/fragrances/${fragrance.slug}`} className="group block transition hover:-translate-y-0.5">
                <Card className="overflow-hidden border-border bg-card transition group-hover:shadow-lg">
                  {fragrance.heroImage ? (
                    <img className="aspect-4/3 w-full object-cover" src={fragrance.heroImage.publicUrl} alt="" />
                  ) : (
                    <div className="aspect-4/3 bg-admin-reef" />
                  )}
                  <div className="p-5">
                    <h3 className="font-heading text-2xl font-semibold">{fragrance.name}</h3>
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
      </Container>
    </Section>
  )
}
