import { HugeiconsIcon } from "@hugeicons/react"
import { BankIcon, DeliveryTruck01Icon, ShoppingCart01Icon } from "@hugeicons/core-free-icons"

import { Container, Section } from "@/components/layouts/container"

const steps = [
  {
    icon: ShoppingCart01Icon,
    title: "Choose your size",
    description: "Pick 2 ml, 5 ml, or 10 ml decants of any fragrance in the collection, and add them to your cart.",
  },
  {
    icon: BankIcon,
    title: "Pay your way",
    description: "Check out as a guest with a bank transfer or cash on delivery — whichever suits you.",
  },
  {
    icon: DeliveryTruck01Icon,
    title: "Delivered to you",
    description: "Hand-decanted and delivered across Malé and the islands, packaged with care.",
  },
]

export function HowItWorksSection() {
  return (
    <Section tone="card">
      <Container className="py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">How it works</p>
        <h2 className="mt-2 max-w-xl font-heading text-3xl font-semibold md:text-4xl">
          From browsing to your doorstep, in three steps.
        </h2>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title}>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-background text-sm font-semibold text-admin-champagne-deep">
                  {index + 1}
                </span>
                <HugeiconsIcon aria-hidden="true" className="size-5 text-admin-reef" icon={step.icon} strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
