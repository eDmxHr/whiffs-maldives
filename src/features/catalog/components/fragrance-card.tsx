/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { Card } from "@/components/ui/card"
import { money } from "@/lib/money"
import type { FragranceView } from "@/types/catalog"

export function FragranceCard({ fragrance }: { fragrance: FragranceView }) {
  const availableOfferings = fragrance.offerings
    .filter((offering) => offering.isActive)
    .sort((a, b) => a.sizeMl - b.sizeMl)
  const fromPrice = availableOfferings.length
    ? Math.min(...availableOfferings.map((offering) => offering.price))
    : null

  return (
    <Link
      href={`/fragrances/${fragrance.slug}`}
      className="group block transition hover:-translate-y-0.5"
    >
      <Card className="overflow-hidden border-border bg-card transition group-hover:shadow-lg">
        {fragrance.heroImage ? (
          <img
            className="aspect-4/3 w-full object-cover"
            src={fragrance.heroImage.publicUrl}
            alt=""
          />
        ) : (
          <div className="aspect-4/3 bg-admin-reef" />
        )}
        <div className="p-5">
          <div className="text-sm text-admin-champagne-deep">
            {fragrance.brand.name}
            {fragrance.concentration ? ` · ${fragrance.concentration}` : ""}
          </div>
          <h3 className="mt-1 font-heading text-2xl font-semibold">
            {fragrance.name}
          </h3>
          {fromPrice !== null ? (
            <p className="mt-3 text-sm text-muted-foreground">
              From {money(fromPrice)}
            </p>
          ) : null}
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-admin-reef">
            Details
            <HugeiconsIcon
              aria-hidden="true"
              className="mt-0.5 size-4 transition-transform group-hover:translate-x-1"
              icon={ArrowRight01Icon}
              strokeWidth={2}
            />
          </span>
        </div>
      </Card>
    </Link>
  )
}
