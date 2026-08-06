import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

export function InlineError({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl bg-admin-danger/12 px-4 py-3 text-sm font-medium text-admin-danger", className)}
      {...props}
    />
  )
}
