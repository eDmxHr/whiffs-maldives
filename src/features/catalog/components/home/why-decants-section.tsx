import { HugeiconsIcon } from "@hugeicons/react"
import { DropletIcon, Money01Icon, SparklesIcon } from "@hugeicons/core-free-icons"

import { Container, Section } from "@/components/layouts/container"

const reasons = [
  {
    icon: SparklesIcon,
    title: "Explore before you commit",
    description: "Try a fragrance properly, over days and moods, before deciding it belongs in your collection.",
  },
  {
    icon: Money01Icon,
    title: "A fraction of the cost",
    description: "Full bottles run into the thousands. Decants let you experience the same fragrance for far less.",
  },
  {
    icon: DropletIcon,
    title: "Nothing goes to waste",
    description: "Every millilitre is measured and hand-poured to order, so you only ever pay for what you'll use.",
  },
]

export function WhyDecantsSection() {
  return (
    <Section tone="card">
      <Container className="py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">Why decants</p>
        <h2 className="mt-2 max-w-xl font-heading text-3xl font-semibold md:text-4xl">
          The smarter way to build a fragrance wardrobe.
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {reasons.map((reason) => (
            <div key={reason.title} className="rounded-xl border border-border bg-card p-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-admin-reef text-white">
                <HugeiconsIcon aria-hidden="true" className="size-5" icon={reason.icon} strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold">{reason.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{reason.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
