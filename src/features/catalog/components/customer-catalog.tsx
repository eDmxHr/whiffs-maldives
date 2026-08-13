/* eslint-disable @next/next/no-img-element */

"use client"

import { useState } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Container, Section } from "@/components/layouts/container"
import { toast } from "@/components/ui/toast"
import { useFragrance, useFragrances } from "@/features/catalog/hooks/use-catalog"
import { useCartStore } from "@/stores/cart-store"
import { money } from "@/lib/money"
import { cn } from "@/lib/utils"

export function CatalogHero() {
  return (
    <Section bordered={false}>
      <Container className="grid min-h-[64svh] content-end py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">Whiffs Maldives</p>
        <h1 className="mt-4 max-w-4xl font-heading text-5xl font-semibold leading-[0.95] md:text-7xl">
          Fragrance discovery, decanted for island air.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          Browse the first published scents, compare GST-inclusive decant sizes, and validate the catalog spine before checkout arrives.
        </p>
      </Container>
    </Section>
  )
}

export function CatalogGrid() {
  const fragrances = useFragrances(true)

  return (
    <Section>
      <Container className="py-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">The collection</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold">Every scent, ready to try</h2>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {fragrances.data?.map((fragrance) => (
            <Link
              href={`/fragrances/${fragrance.slug}`}
              key={fragrance.id}
              className="group block transition hover:-translate-y-0.5"
            >
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
                  <div className="mt-4 flex flex-wrap gap-2">
                    {fragrance.offerings.map((offering) => (
                      <Badge key={offering.id} className="bg-card text-admin-reef" variant="secondary">
                        {offering.name} · {money(offering.price)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {fragrances.data && fragrances.data.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">New fragrances are being added — check back soon.</p>
        ) : null}
      </Container>
    </Section>
  )
}

export function CustomerFragrance({ slug }: { slug: string }) {
  const fragrance = useFragrance(slug)
  const item = fragrance.data
  const addLine = useCartStore((state) => state.addLine)
  const [selectedOfferingId, setSelectedOfferingId] = useState<string | null>(null)

  const selectedOffering = item?.offerings.find((offering) => offering.id === selectedOfferingId)

  function handleAddToCart() {
    if (!item || !selectedOffering) {
      return
    }

    addLine({
      fragranceId: item.id,
      offeringId: selectedOffering.id,
      fragranceName: item.name,
      brandName: item.brand.name,
      sizeMl: selectedOffering.sizeMl,
      price: selectedOffering.price,
      heroImageUrl: item.heroImage?.publicUrl,
    })

    toast.add({ title: "Added to cart", description: `${item.name} · ${selectedOffering.name}`, type: "success" })
  }

  if (fragrance.isLoading) {
    return (
      <Section bordered={false}>
        <Container className="py-8">Loading fragrance...</Container>
      </Section>
    )
  }

  if (!item) {
    return (
      <Section bordered={false}>
        <Container className="py-8">Fragrance not found.</Container>
      </Section>
    )
  }

  return (
    <Section bordered={false}>
      <Container className="grid gap-8 py-8 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          {item.heroImage ? (
            <img className="aspect-4/5 w-full rounded-2xl object-cover" src={item.heroImage.publicUrl} alt="" />
          ) : (
            <div className="aspect-4/5 rounded-2xl bg-admin-reef" />
          )}
          <div className="mt-3 grid grid-cols-4 gap-3">
            {item.images.map((image) => (
              <img key={image.id} className="aspect-square rounded-xl object-cover" src={image.publicUrl} alt="" />
            ))}
          </div>
        </div>

        <div className="py-4">
          <Link className="text-sm text-admin-champagne-deep" href="/">
            Browse fragrances
          </Link>
          <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-admin-champagne">{item.brand.name}</p>
          <h1 className="mt-3 font-heading text-5xl font-semibold leading-none">{item.name}</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {item.concentration} · {item.gender}
          </p>
          <p className="mt-6 max-w-xl text-base leading-7 text-foreground/80">{item.description}</p>

          <div className="mt-8 grid gap-3">
            {item.offerings.map((offering) => {
              const selected = offering.id === selectedOfferingId

              return (
                <button
                  key={offering.id}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-4 text-left transition",
                    offering.isActive
                      ? selected
                        ? "border-admin-reef bg-card ring-2 ring-admin-reef/30"
                        : "border-border bg-card hover:border-admin-reef/50"
                      : "cursor-not-allowed border-border bg-card opacity-50"
                  )}
                  disabled={!offering.isActive}
                  onClick={() => setSelectedOfferingId(offering.id)}
                  type="button"
                >
                  <div>
                    <div className="font-medium">{offering.name} decant</div>
                    <div className="text-xs text-muted-foreground">
                      {offering.isActive ? "GST included" : "Out of stock"}
                    </div>
                  </div>
                  <div className="font-semibold">{money(offering.price)}</div>
                </button>
              )
            })}
          </div>

          <Card className="mt-8 grid gap-3 border-border bg-card p-5">
            <h2 className="font-heading text-2xl font-semibold">Notes</h2>
            {(["top", "heart", "base"] as const).map((level) => (
              <div key={level} className="flex gap-4 text-sm">
                <div className="w-16 shrink-0 uppercase tracking-wide text-admin-champagne-deep">{level}</div>
                <div>{item.notes.filter((note) => note.pyramidLevel === level).map((note) => note.name).join(", ") || "To be added"}</div>
              </div>
            ))}
          </Card>

          <Button className="mt-8" disabled={!selectedOffering} onClick={handleAddToCart} variant="luxury">
            {selectedOffering ? `Add ${selectedOffering.name} to cart` : "Select a size"}
          </Button>
        </div>
      </Container>
    </Section>
  )
}
