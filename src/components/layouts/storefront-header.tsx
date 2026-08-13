"use client"

import { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, Menu01Icon } from "@hugeicons/core-free-icons"

import { CartTrigger } from "@/components/cart/cart-trigger"
import { Container } from "@/components/layouts/container"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const fragranceCategories = [
  { label: "All fragrances", href: "/fragrances" },
  { label: "New arrivals", href: "/fragrances?view=new" },
  { label: "Best sellers", href: "/fragrances?view=best-sellers" },
  { label: "Men", href: "/fragrances?gender=men" },
  { label: "Women", href: "/fragrances?gender=women" },
  { label: "Unisex", href: "/fragrances?gender=unisex" },
]

const otherLinks = [
  { label: "Brands", href: "/brands" },
  { label: "How it works", href: "/#how-it-works" },
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
                <p className="px-2 pt-2 pb-1 text-xs font-semibold tracking-widest text-admin-champagne uppercase">
                  Fragrances
                </p>
                {fragranceCategories.map((link) => (
                  <Link
                    key={link.href}
                    className="rounded-lg px-2 py-3 text-base font-medium text-foreground transition hover:bg-muted"
                    href={link.href}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-2 border-t border-border" />
                {otherLinks.map((link) => (
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
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 transition hover:text-foreground data-popup-open:text-foreground">
              Fragrances
              <HugeiconsIcon aria-hidden="true" className="size-3.5" icon={ArrowDown01Icon} strokeWidth={2} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-44">
              {fragranceCategories.map((link) => (
                <DropdownMenuItem key={link.href} render={<Link href={link.href} />}>
                  {link.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {otherLinks.map((link) => (
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
