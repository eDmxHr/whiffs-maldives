import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "bg-background text-foreground",
        luxury: "bg-admin-reef text-white",
        neutral: "bg-muted text-muted-foreground",
        success: "bg-admin-success/12 text-admin-success",
        warning: "bg-admin-warning/15 text-[color-mix(in_oklch,var(--admin-warning),black_28%)]",
        danger: "bg-admin-danger/12 text-admin-danger",
        info: "bg-admin-info/12 text-admin-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
export type { BadgeVariant }
