/* eslint-disable @next/next/no-img-element */

import { Container, Section } from "@/components/layouts/container"
import { Reveal } from "@/components/motion/reveal"

const steps = [
  {
    number: "1",
    title: "Choose your fragrance",
    description: "Browse the collection, pick the size that suits you, and add it to your cart.",
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&q=80&auto=format&fit=crop",
    alt: "Perfume bottle in moody light",
  },
  {
    number: "2",
    title: "Pay your way",
    description: "Check out as a guest with a bank transfer or cash on delivery — whichever suits you.",
    image:
      "https://images.unsplash.com/photo-1628527304948-06157ee3c8a6?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Paying for an order",
  },
  {
    number: "3",
    title: "Delivered to you",
    description: "Hand-decanted and delivered across Malé and the islands, packaged with care.",
    image:
      "https://images.unsplash.com/photo-1740842028123-56fd319de33a?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Order delivered to your door",
  },
]

export function HowItWorksSection() {
  return (
    <Section id="how-it-works" tone="card">
      <Container className="py-20 md:py-28">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">How it works</p>
          <h2 className="mt-2 max-w-xl font-heading text-4xl font-semibold md:text-5xl">
            From browsing to your doorstep, in three steps.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            No account needed, no minimums — pick a scent, tell us where to send it, and it leaves Malé hand-poured.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index === 0 ? 0 : index === 1 ? 150 : 300}>
              <div className="flex h-full flex-col rounded-2xl bg-background p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-heading text-xl font-semibold">{step.title}</h3>
                  <span className="font-heading text-2xl font-semibold text-admin-champagne">{step.number}</span>
                </div>
                <p className="mt-3 mb-6 text-sm leading-7 text-muted-foreground">{step.description}</p>
                <img
                  alt={step.alt}
                  className="mt-auto aspect-4/3 w-full rounded-xl object-cover"
                  loading="lazy"
                  src={step.image}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
