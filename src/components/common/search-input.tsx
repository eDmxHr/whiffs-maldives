import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SearchInputProps = React.ComponentProps<typeof Input>

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <HugeiconsIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        icon={Search01Icon}
        strokeWidth={1.5}
      />
      <Input className={cn("pl-9", className)} type="search" {...props} />
    </div>
  )
}
