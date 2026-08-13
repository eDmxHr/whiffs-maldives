import Link from "next/link"

import { Container } from "@/components/layouts/container"

export function StorefrontFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <Container className="grid gap-8 py-12 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="font-heading text-lg font-semibold text-foreground">Whiffs Maldives</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Authentic fragrances, decanted for island air. Explore before you commit to a full bottle.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-muted-foreground md:items-end">
          <Link className="transition hover:text-foreground" href="/">
            Browse fragrances
          </Link>
          <Link className="text-xs text-muted-foreground/70 transition hover:text-foreground" href="/admin">
            Staff sign in
          </Link>
        </div>
      </Container>

      <Container className="flex flex-col gap-1 border-t border-border py-5 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} Whiffs Maldives. All rights reserved.</p>
        <p>Prices are GST-inclusive.</p>
      </Container>
    </footer>
  )
}
