import Link from "next/link"

import { CartTrigger } from "@/components/cart/cart-trigger"
import { Container } from "@/components/layouts/container"

export function StorefrontHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm supports-backdrop-filter:bg-background/70">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Whiffs Maldives
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex" aria-label="Primary">
          <Link className="transition hover:text-foreground" href="/">
            Fragrances
          </Link>
        </nav>

        <CartTrigger />
      </Container>
    </header>
  )
}
