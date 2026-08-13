"use client"

import { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu01Icon } from "@hugeicons/core-free-icons"

import { CartTrigger } from "@/components/cart/cart-trigger"
import { Container } from "@/components/layouts/container"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const fragranceLinks = [
  { label: "New Arrivals", href: "/fragrances?view=new" },
  { label: "For Him", href: "/fragrances?gender=men" },
  { label: "For Her", href: "/fragrances?gender=women" },
  { label: "Unisex", href: "/fragrances?gender=unisex" },
  { label: "Best Sellers", href: "/fragrances?view=best-sellers" },
]

export function StorefrontHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm supports-backdrop-filter:bg-background/70">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-1">
          <Sheet onOpenChange={setMobileNavOpen} open={mobileNavOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className="flex size-10 items-center justify-center rounded-lg text-foreground transition hover:bg-muted md:hidden"
            >
              <HugeiconsIcon aria-hidden="true" className="size-5" icon={Menu01Icon} strokeWidth={1.5} />
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="font-heading text-xl font-semibold">Whiffs Maldives</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Primary">
                {fragranceLinks.map((link) => (
                  <Link
                    key={link.href}
                    className="rounded-lg px-2 py-3 text-base font-medium text-foreground transition hover:bg-muted"
                    href={link.href}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Whiffs Maldives
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex" aria-label="Primary">
          {fragranceLinks.map((link) => (
            <Link key={link.href} className="transition hover:text-foreground" href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <CartTrigger />
      </Container>
    </header>
  )
}
