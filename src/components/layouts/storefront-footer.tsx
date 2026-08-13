import Link from "next/link"

import { Container } from "@/components/layouts/container"

const footerColumns = [
  {
    heading: "Shop",
    links: [
      { label: "Fragrances", href: "/fragrances" },
      { label: "Brands", href: "/brands" },
      { label: "Your cart", href: "/cart" },
    ],
  },
  {
    heading: "Discover",
    links: [
      { label: "Why decants", href: "/#why-decants" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Authenticity", href: "/#authenticity" },
    ],
  },
]

export function StorefrontFooter() {
  return (
    <footer className="bg-background px-3 pb-3 sm:px-4 sm:pb-4 md:px-5 md:pb-5">
      <div className="overflow-hidden rounded-b-3xl bg-admin-reef-deep text-admin-pearl">
        <Container className="grid gap-12 pt-16 pb-14 md:grid-cols-[1.2fr_1fr] md:gap-20 md:pt-20">
          <div>
            <p className="font-heading text-2xl font-semibold">
              Whiffs Maldives
            </p>
            <p className="mt-4 max-w-sm text-sm leading-7 text-admin-pearl/65">
              Authentic fragrances, hand-poured to order and delivered
              across the islands. Explore a scent properly before committing to
              the bottle.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10">
            {footerColumns.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <p className="text-xs font-semibold tracking-widest text-admin-champagne uppercase">
                  {column.heading}
                </p>
                <ul className="mt-5 grid gap-3 text-sm">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        className="text-admin-pearl/75 transition hover:text-admin-pearl"
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </Container>

        <Container className="flex flex-col gap-2 border-t border-admin-pearl/15 py-6 text-xs text-admin-pearl/55 md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Whiffs Maldives. All rights
            reserved.
          </p>
        </Container>

        <Container aria-hidden="true" className="@container overflow-hidden pt-6 select-none">
          <p className="bg-linear-to-b from-admin-pearl/45 via-admin-pearl/20 to-transparent bg-clip-text text-center font-heading text-[25cqw] leading-[0.78] font-semibold tracking-tight text-transparent uppercase">
            Whiffs
          </p>
        </Container>
      </div>
    </footer>
  )
}
