import type { ReactNode } from "react"
import Link from "next/link"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import type { VariantProps } from "class-variance-authority"

import { buttonVariants } from "@/components/ui/button"

type IconLinkProps = {
  href: string
  icon: IconSvgElement
  children: ReactNode
  variant?: VariantProps<typeof buttonVariants>["variant"]
}

export function IconLink({ href, icon, children, variant = "outline" }: IconLinkProps) {
  return (
    <Link className={buttonVariants({ variant })} href={href}>
      <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={icon} strokeWidth={1.5} />
      {children}
    </Link>
  )
}
