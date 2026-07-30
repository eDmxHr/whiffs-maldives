import type { ReactNode } from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

import { cn } from "@/lib/utils"

type EmptyStateProps = {
  title: string
  description?: string
  icon?: IconSvgElement
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("grid place-items-center rounded-xl bg-card p-8 text-center", className)}>
      <div className="max-w-sm">
        {icon ? (
          <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-lg bg-background text-admin-reef">
            <HugeiconsIcon aria-hidden="true" className="size-5" icon={icon} strokeWidth={1.5} />
          </div>
        ) : null}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  )
}
