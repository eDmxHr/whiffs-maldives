import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

type LoadingStateProps = {
  label?: string
  surface?: "card" | "plain"
  className?: string
}

const surfaceClasses = {
  card: "flex flex-col rounded-2xl bg-card p-2",
  plain: "",
}

const contentClasses = {
  card: "flex-1 rounded-xl bg-background p-6 md:p-8",
  plain: "p-6 md:p-8",
}

export function LoadingState({ label = "Loading...", surface = "card", className }: LoadingStateProps) {
  return (
    <div className={cn(surfaceClasses[surface], className)}>
      <div className={cn("grid place-items-center text-center", contentClasses[surface])}>
        <div className="flex flex-col items-center gap-3">
          <HugeiconsIcon
            aria-hidden="true"
            className="size-5 animate-spin text-admin-reef"
            icon={Loading03Icon}
            strokeWidth={1.5}
          />
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}
