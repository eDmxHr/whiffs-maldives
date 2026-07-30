import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { AlertCircleIcon } from "@hugeicons/core-free-icons"

import { Badge, type BadgeVariant } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusBadgeConfig = Record<
  string,
  {
    label: string
    variant: BadgeVariant
    icon?: IconSvgElement
    className?: string
    description?: string
  }
>

type StatusBadgeProps = {
  status: string
  config: StatusBadgeConfig
  className?: string
}

export function StatusBadge({ status, config, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase()
  const item = config[status] ?? config[normalizedStatus] ?? {
    label: status,
    variant: "neutral" as const,
    icon: AlertCircleIcon,
    description: "Status is not configured yet.",
  }

  return (
    <Badge
      variant={item.variant}
      className={cn("capitalize", item.className, className)}
      title={item.description}
      aria-label={item.description ? `${item.label}: ${item.description}` : item.label}
    >
      {item.icon ? <HugeiconsIcon aria-hidden="true" className="size-3.5" icon={item.icon} strokeWidth={1.5} /> : null}
      {item.label}
    </Badge>
  )
}
