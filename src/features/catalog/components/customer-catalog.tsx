/* eslint-disable @next/next/no-img-element */

"use client"

import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useFragrance, useFragrances } from "@/features/catalog/hooks/use-catalog"
import { money } from "@/lib/money"

export function CustomerCatalog() {
  const fragrances = useFragrances(true)

  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto grid min-h-[72svh] max-w-7xl content-end px-5 py-10 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">Whiffs Maldives</p>
        <h1 className="mt-4 max-w-4xl font-heading text-5xl font-semibold leading-[0.95] md:text-7xl">
          Fragrance discovery, decanted for island air.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          Browse the first published scents, compare GST-inclusive decant sizes, and validate the catalog spine before checkout arrives.
        </p>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-8 md:grid-cols-3 md:px-8">
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
                <h2 className="mt-1 font-heading text-2xl font-semibold">{fragrance.name}</h2>
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
      </section>
    </main>
  )
}

export function CustomerFragrance({ slug }: { slug: string }) {
  const fragrance = useFragrance(slug)
  const item = fragrance.data

  if (fragrance.isLoading) {
    return <main className="min-h-svh bg-background p-8">Loading fragrance...</main>
  }

  if (!item) {
    return <main className="min-h-svh bg-background p-8">Fragrance not found.</main>
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:grid-cols-[1.05fr_0.95fr] md:px-8">
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
            {item.offerings.map((offering) => (
              <div key={offering.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div>
                  <div className="font-medium">{offering.name} decant</div>
                  <div className="text-xs text-muted-foreground">GST included</div>
                </div>
                <div className="font-semibold">{money(offering.price)}</div>
              </div>
            ))}
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

          <Button className="mt-8">Checkout coming next</Button>
        </div>
      </section>
    </main>
  )
}
