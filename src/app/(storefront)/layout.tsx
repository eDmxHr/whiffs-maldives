import type { ReactNode } from "react"

import { StorefrontFooter } from "@/components/layouts/storefront-footer"
import { StorefrontHeader } from "@/components/layouts/storefront-header"

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <StorefrontHeader />
      <div className="flex-1">{children}</div>
      <StorefrontFooter />
    </div>
  )
}
