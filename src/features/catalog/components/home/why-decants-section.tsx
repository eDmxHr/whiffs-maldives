/* eslint-disable @next/next/no-img-element */

import { Container, Section } from "@/components/layouts/container"
import { Reveal } from "@/components/motion/reveal"

const reasons = [
  {
    number: "01",
    title: "Explore before you commit",
    description: "Try a fragrance properly, over days and moods, before deciding it belongs in your collection.",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80&auto=format&fit=crop",
    alt: "Amber glass bottle in warm island light",
  },
  {
    number: "02",
    title: "A fraction of the cost",
    description: "Full bottles run into the thousands. Decants let you experience the same fragrance for far less.",
    image:
      "https://images.unsplash.com/photo-1768207450151-30c0bf8e8091?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "A small decant bottle",
  },
  {
    number: "03",
    title: "Nothing goes to waste",
    description: "Every millilitre is measured and hand-poured to order, so you only ever pay for what you'll use.",
    image:
      "https://images.unsplash.com/photo-1535868118629-f37bcd69ff59?q=80&w=1476&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Carefully measured fragrance",
  },
]

export function WhyDecantsSection() {
  return (
    <Section id="why-decants" tone="card">
      <Container className="py-20 md:py-28">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">Why decants</p>
          <h2 className="mt-2 max-w-xl font-heading text-4xl font-semibold md:text-5xl">
            The smarter way to build a fragrance wardrobe.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            The scents are real, the bottles are smaller — and your collection grows with far less risk.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {reasons.map((reason, index) => (
            <Reveal key={reason.number} delay={index === 0 ? 0 : index === 1 ? 150 : 300}>
              <div className="flex h-full flex-col rounded-2xl bg-background p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-heading text-xl font-semibold">{reason.title}</h3>
                  <span className="font-heading text-2xl font-semibold text-admin-champagne">{reason.number}</span>
                </div>
                <p className="mt-3 mb-6 text-sm leading-7 text-muted-foreground">{reason.description}</p>
                <img alt={reason.alt} className="mt-auto aspect-4/3 w-full rounded-xl object-cover" loading="lazy" src={reason.image} />
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
