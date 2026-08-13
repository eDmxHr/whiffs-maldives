import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import { Container } from "@/components/layouts/container"
import { Reveal } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

const marks = [
  "Sourced from authorised suppliers",
  "Every bottle checked",
  "Hand-decanted to order",
]

export function TrustSection() {
  return (
    <section id="authenticity" className="scroll-mt-20 bg-background px-3 pt-3 sm:px-4 sm:pt-4 md:px-5 md:pt-5">
      <div className="rounded-t-3xl bg-admin-reef-deep text-admin-pearl">
        <Container className="py-20 text-center md:py-28">
          <Reveal>
            <p className="text-xs font-semibold tracking-widest text-admin-champagne uppercase">
              Authenticity
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl font-heading text-4xl font-semibold md:text-6xl">
              Every bottle, verified{" "}
              <span className="text-admin-pearl/60">
                before it&apos;s decanted.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-admin-pearl/70">
              What you receive is exactly what&apos;s on the label — no
              substitutes, no dilution. If we wouldn&apos;t wear it, we
              won&apos;t pour it.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {marks.map((mark) => (
                <span
                  key={mark}
                  className="flex items-center gap-2 text-sm font-medium text-admin-pearl/85"
                >
                  <HugeiconsIcon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-admin-champagne"
                    icon={CheckmarkCircle02Icon}
                    strokeWidth={1.5}
                  />
                  {mark}
                </span>
              ))}
            </div>

            <Link
              className={cn(
                "group mt-12 inline-flex h-11 items-center gap-2 rounded-lg bg-admin-pearl px-5 text-sm font-semibold text-admin-reef-deep shadow-sm transition hover:bg-white"
              )}
              href="/#collection"
            >
              Browse the collection
            </Link>
          </Reveal>
        </Container>
      </div>
    </section>
  )
}
