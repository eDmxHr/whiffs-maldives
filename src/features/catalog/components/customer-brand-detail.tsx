"use client"

import Link from "next/link"

import { Container, Section } from "@/components/layouts/container"
import { Reveal } from "@/components/motion/reveal"
import { FragranceCard } from "@/features/catalog/components/fragrance-card"
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

        <div className="mt-12 grid gap-5 md:grid-cols-3 xl:grid-cols-4">
          {brandFragrances.map((fragrance, index) => (
            <Reveal delay={index === 0 ? 0 : index === 1 ? 150 : 300} key={fragrance.id}>
              <FragranceCard fragrance={fragrance} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
