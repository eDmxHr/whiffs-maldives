import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

import { cn } from "@/lib/utils"

type MetricCardProps = {
  label: string
  value: string
  detail?: string
  icon?: IconSvgElement
  tone?: "default" | "success" | "warning" | "info"
  className?: string
}

const toneClasses = {
  default: "text-admin-reef",
  success: "text-admin-success",
  warning: "text-admin-warning",
  info: "text-admin-info",
}

export function MetricCard({ label, value, detail, icon, tone = "default", className }: MetricCardProps) {
  return (
    <div className={cn("flex flex-col rounded-2xl bg-card p-2 text-sm text-card-foreground", className)}>
      <div className="flex flex-1 flex-col rounded-xl bg-background p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
            <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
          </div>
          {icon ? (
            <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted", toneClasses[tone])}>
              <HugeiconsIcon aria-hidden="true" className="size-4.5" icon={icon} strokeWidth={1.5} />
            </div>
          ) : null}
        </div>
        {detail ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{detail}</p> : null}
      </div>
    </div>
  )
}
