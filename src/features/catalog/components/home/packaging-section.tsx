import { Package01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Container, Section } from "@/components/layouts/container"

export function PackagingSection() {
  return (
    <Section tone="card" className="overflow-hidden">
      <Container className="grid gap-10 py-16 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div className="flex aspect-4/3 items-center justify-center rounded-2xl bg-admin-reef text-white md:aspect-auto md:h-full">
          <HugeiconsIcon aria-hidden="true" className="size-16" icon={Package01Icon} strokeWidth={1} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">Packaging</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold md:text-4xl">Minimal, considered, worth keeping.</h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
            Every order arrives in warm ivory and deep green packaging designed to feel like a gift, not a shipment —
            no cartoon labels, no excess. Just the fragrance, presented well.
          </p>
        </div>
      </Container>
    </Section>
  )
}
