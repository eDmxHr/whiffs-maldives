/* eslint-disable @next/next/no-img-element */

"use client"

import { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Cancel01Icon,
  ZoomInAreaIcon,
} from "@hugeicons/core-free-icons"
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Container, Section } from "@/components/layouts/container"
import { toast } from "@/components/ui/toast"
import { FragranceCard } from "@/features/catalog/components/fragrance-card"
import {
  useFragrance,
  useFragrances,
} from "@/features/catalog/hooks/use-catalog"
import { useCartStore } from "@/stores/cart-store"
import { money } from "@/lib/money"
import { cn } from "@/lib/utils"

export function CatalogHero() {
  return (
    <section className="bg-background p-3 sm:p-4 md:p-5">
      <div className="relative flex min-h-[86svh] overflow-hidden rounded-3xl bg-admin-reef-deep">
        <img
          alt="Spraying a golden fragrance"
          className="absolute inset-0 size-full animate-in object-cover object-center duration-1000 fill-mode-both fade-in"
          src="https://images.unsplash.com/photo-1622618991746-fe6004db3a47?q=80&w=1600&auto=format&fit=crop"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-b from-black/50 via-black/10 to-black/70 md:from-black/45 md:via-black/15 md:to-black/60"
        />

        <Container className="relative flex flex-1 flex-col justify-end gap-10 pt-16 pb-8 md:justify-between md:gap-0 md:pt-20 md:pb-12">
          <div>
            <p className="animate-in text-xs font-semibold tracking-widest text-admin-champagne uppercase delay-200 duration-700 fill-mode-both fade-in slide-in-from-bottom-4">
              Whiffs Maldives
            </p>
            <h1 className="mt-5 max-w-3xl animate-in font-heading text-4xl leading-[1.02] font-semibold text-admin-pearl delay-300 duration-700 fill-mode-both fade-in slide-in-from-bottom-4 sm:text-5xl md:text-7xl md:leading-[0.98]">
              Fragrance discovery,{" "}
              <span className="text-admin-pearl/60">
                decanted for island air.
              </span>
            </h1>
          </div>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end md:gap-8">
            <p className="max-w-sm animate-in text-sm leading-7 text-admin-pearl/80 delay-500 duration-700 fill-mode-both fade-in slide-in-from-bottom-4">
              Authentic fragrances from Middle Eastern houses to designer,
              niche, and high-end labels — hand-poured to order, so you can
              explore with confidence before committing to the bottle.
            </p>
            <Link
              className={cn(
                buttonVariants({ variant: "luxury", size: "lg" }),
                "group w-fit animate-in delay-500 duration-700 fill-mode-both fade-in"
              )}
              href="/fragrances"
            >
              Browse the collection
            </Link>
          </div>
        </Container>
      </div>
    </section>
  )
}

export function CatalogGrid() {
  const fragrances = useFragrances(true)
  const sortedFragrances = fragrances.data
    ? [...fragrances.data].sort(
        (a, b) => Number(b.isFeatured) - Number(a.isFeatured)
      )
    : fragrances.data

  return (
    <Section id="collection">
      <Container className="py-20 md:py-28">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest text-admin-champagne uppercase">
              The collection
            </p>
            <h2 className="mt-2 font-heading text-4xl font-semibold md:text-5xl">
              Every scent, ready to try
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Every fragrance we carry, ready to try before you commit to a
              bottle.
            </p>
          </div>
          <Link
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-admin-reef transition"
            href="/fragrances"
          >
            View all
            <HugeiconsIcon
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-1"
              icon={ArrowRight01Icon}
              strokeWidth={2}
            />
          </Link>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3 xl:grid-cols-4">
          {sortedFragrances?.map((fragrance) => (
            <FragranceCard fragrance={fragrance} key={fragrance.id} />
          ))}
        </div>

        {fragrances.data && fragrances.data.length === 0 ? (
          <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-admin-champagne/50 px-6 py-20 text-center">
            <div aria-hidden="true" className="flex items-end gap-2 opacity-70">
              <div className="h-10 w-4 rounded-sm bg-admin-reef/25" />
              <div className="h-14 w-5 rounded-sm bg-admin-reef/40" />
              <div className="h-12 w-4 rounded-sm bg-admin-reef/25" />
            </div>
            <p className="mt-6 font-heading text-2xl font-semibold">
              The first pours are on their way
            </p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              We are decanting the opening collection now — check back soon.
            </p>
          </div>
        ) : null}
      </Container>
    </Section>
  )
}

export function CustomerFragrance({ slug }: { slug: string }) {
  const fragrance = useFragrance(slug)
  const item = fragrance.data
  const allFragrances = useFragrances(true)
  const addLine = useCartStore((state) => state.addLine)
  const [selectedOfferingId, setSelectedOfferingId] = useState<string | null>(
    null
  )
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const selectedOffering = item?.offerings.find(
    (offering) => offering.id === selectedOfferingId
  )

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

    toast.add({
      title: "Added to cart",
      description: `${item.name} · ${selectedOffering.name}`,
      type: "success",
    })
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

  const activeImage = item.images[activeImageIndex]

  const similarFragrances = (allFragrances.data ?? [])
    .filter((candidate) => candidate.id !== item.id)
    .sort((a, b) => {
      const aScore =
        (a.brandId === item.brandId ? 2 : 0) +
        (a.gender === item.gender ? 1 : 0)
      const bScore =
        (b.brandId === item.brandId ? 2 : 0) +
        (b.gender === item.gender ? 1 : 0)
      return bScore - aScore
    })
    .slice(0, 4)

  return (
    <Section bordered={false}>
      <Container className="grid gap-8 py-8 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <button
            className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-2xl"
            onClick={() => setLightboxOpen(true)}
            type="button"
          >
            {activeImage ? (
              <img
                className="size-full object-cover"
                src={activeImage.publicUrl}
                alt=""
              />
            ) : (
              <div className="size-full bg-admin-reef" />
            )}
            {activeImage ? (
              <span className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 transition group-hover:opacity-100">
                <HugeiconsIcon
                  aria-hidden="true"
                  className="size-4"
                  icon={ZoomInAreaIcon}
                  strokeWidth={1.5}
                />
              </span>
            ) : null}
          </button>

          {item.images.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {item.images.map((image, index) => (
                <button
                  key={image.id}
                  className={cn(
                    "aspect-square overflow-hidden rounded-xl outline-2 outline-offset-2 transition",
                    index === activeImageIndex
                      ? "outline-admin-reef"
                      : "outline-transparent hover:outline-border"
                  )}
                  onClick={() => setActiveImageIndex(index)}
                  type="button"
                >
                  <img
                    className="size-full object-cover"
                    src={image.publicUrl}
                    alt=""
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="py-4">
          <p className="text-xs font-semibold tracking-widest text-admin-champagne uppercase">
            {item.brand.name}
          </p>
          <h1 className="mt-3 font-heading text-5xl leading-none font-semibold">
            {item.name}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {item.concentration} · {item.gender}
          </p>
          <p className="mt-6 max-w-xl text-base leading-7 text-foreground/80">
            {item.description}
          </p>

          <Card className="mt-8 grid gap-3 border-border bg-card p-5">
            <h2 className="font-heading text-2xl font-semibold">Notes</h2>
            {(["top", "heart", "base"] as const).map((level) => (
              <div key={level} className="flex gap-4 text-sm">
                <div className="w-16 shrink-0 tracking-wide text-admin-champagne-deep uppercase">
                  {level}
                </div>
                <div>
                  {item.notes
                    .filter((note) => note.pyramidLevel === level)
                    .map((note) => note.name)
                    .join(", ") || "To be added"}
                </div>
              </div>
            ))}
          </Card>

          <div className="mt-8 flex flex-wrap gap-3">
            {item.offerings.map((offering) => {
              const selected = offering.id === selectedOfferingId

              return (
                <button
                  key={offering.id}
                  className={cn(
                    "min-w-24 flex-1 rounded-xl border px-4 py-3 text-center transition",
                    offering.isActive
                      ? selected
                        ? "border-admin-reef bg-admin-reef text-white"
                        : "border-border bg-card hover:border-admin-reef/50"
                      : "cursor-not-allowed border-border bg-card opacity-40"
                  )}
                  disabled={!offering.isActive}
                  onClick={() => setSelectedOfferingId(offering.id)}
                  type="button"
                >
                  <div className="text-sm font-semibold">{offering.name}</div>
                  <div
                    className={cn(
                      "mt-0.5 text-xs",
                      selected ? "text-white/80" : "text-muted-foreground"
                    )}
                  >
                    {offering.isActive ? money(offering.price) : "Out of stock"}
                  </div>
                </button>
              )
            })}
          </div>

          <Button
            className="mt-8"
            disabled={!selectedOffering}
            onClick={handleAddToCart}
            variant="luxury"
          >
            {selectedOffering
              ? `Add ${selectedOffering.name} to cart · ${money(selectedOffering.price)}`
              : "Select a size"}
          </Button>
        </div>
      </Container>

      {similarFragrances.length > 0 ? (
        <Container className="py-8">
          <h2 className="font-heading text-2xl font-semibold">
            Similar fragrances
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-4">
            {similarFragrances.map((candidate) => (
              <FragranceCard fragrance={candidate} key={candidate.id} />
            ))}
          </div>
        </Container>
      ) : null}

      <Lightbox
        close={() => setLightboxOpen(false)}
        controller={{ closeOnBackdropClick: true }}
        index={activeImageIndex}
        on={{ view: ({ index }) => setActiveImageIndex(index) }}
        open={lightboxOpen}
        render={{
          iconClose: () => (
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} />
          ),
        }}
        slides={item.images.map((image) => ({
          src: image.publicUrl,
          alt: item.name,
        }))}
      />
    </Section>
  )
}
