import { HugeiconsIcon } from "@hugeicons/react"
import { Award01Icon, CheckmarkBadge01Icon, ShieldUserIcon } from "@hugeicons/core-free-icons"

import { Container, Section } from "@/components/layouts/container"

const marks = [
  { icon: CheckmarkBadge01Icon, label: "100% authentic" },
  { icon: ShieldUserIcon, label: "Sourced directly from suppliers" },
  { icon: Award01Icon, label: "Hand-decanted with care" },
]

export function TrustSection() {
  return (
    <Section>
      <Container className="py-16">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">Authenticity</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold md:text-4xl">Every bottle, verified before it&apos;s decanted.</h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
              We source directly from authorised suppliers and check every bottle before it enters our inventory.
              What you receive is exactly what&apos;s on the label — no substitutes, no dilution.
            </p>
          </div>

          <div className="grid gap-4">
            {marks.map((mark) => (
              <div key={mark.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <HugeiconsIcon aria-hidden="true" className="size-5 shrink-0 text-admin-reef" icon={mark.icon} strokeWidth={1.5} />
                <span className="text-sm font-medium">{mark.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
