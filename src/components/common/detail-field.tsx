import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

const colsClasses = {
  2: "grid-cols-2",
  3: "grid-cols-3",
}

type DetailGridProps = HTMLAttributes<HTMLDivElement> & {
  cols?: 2 | 3
}

export function DetailGrid({ cols = 3, className, ...props }: DetailGridProps) {
  return <div className={cn("mt-3 grid gap-4", colsClasses[cols], className)} {...props} />
}

type DetailFieldProps = {
  label: string
  value: ReactNode
}

export function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  )
}
