import type { ReactNode } from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

import { cn } from "@/lib/utils"

type EmptyStateProps = {
  title: string
  description?: string
  icon?: IconSvgElement
  action?: ReactNode
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

export function EmptyState({ title, description, icon, action, surface = "card", className }: EmptyStateProps) {
  return (
    <div className={cn(surfaceClasses[surface], className)}>
      <div className={cn("grid place-items-center text-center", contentClasses[surface])}>
        <div className="max-w-sm">
          {icon ? (
            <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-lg bg-card text-admin-reef">
              <HugeiconsIcon aria-hidden="true" className="size-5" icon={icon} strokeWidth={1.5} />
            </div>
          ) : null}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </div>
  )
}
