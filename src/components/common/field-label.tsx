import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

export function FieldLabel({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs font-semibold tracking-wide text-muted-foreground uppercase", className)}
      {...props}
    />
  )
}
