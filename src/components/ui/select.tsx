"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { ArrowDown01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"

function Select<Value, Multiple extends boolean | undefined = false>(props: SelectPrimitive.Root.Props<Value, Multiple>) {
  return <SelectPrimitive.Root {...props} />
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-input bg-background px-3 text-left text-sm font-medium text-foreground shadow-xs transition-colors duration-150 outline-none select-none hover:not-data-disabled:bg-muted/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-popup-open:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="text-muted-foreground">
        <HugeiconsIcon aria-hidden="true" className="size-4" icon={ArrowDown01Icon} strokeWidth={1.5} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectValue({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("min-w-0 truncate data-placeholder:text-muted-foreground", className)}
      {...props}
    />
  )
}

type SelectContentProps = React.ComponentProps<typeof SelectPrimitive.Popup> & {
  align?: React.ComponentProps<typeof SelectPrimitive.Positioner>["align"]
  alignOffset?: React.ComponentProps<typeof SelectPrimitive.Positioner>["alignOffset"]
  sideOffset?: React.ComponentProps<typeof SelectPrimitive.Positioner>["sideOffset"]
}

function SelectContent({ className, children, align = "center", alignOffset = 0, sideOffset = 6, ...props }: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        align={align}
        alignItemWithTrigger={false}
        alignOffset={alignOffset}
        className="z-50 outline-hidden"
        sideOffset={sideOffset}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "max-h-[min(var(--available-height),18rem)] w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl shadow-admin-reef/10 outline-hidden transition-[scale,opacity] duration-150 data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0",
            className
          )}
          {...props}
        >
          <SelectPrimitive.ScrollUpArrow className="flex h-6 cursor-default items-center justify-center bg-popover text-muted-foreground">
            <HugeiconsIcon aria-hidden="true" className="size-3.5 rotate-180" icon={ArrowDown01Icon} strokeWidth={1.5} />
          </SelectPrimitive.ScrollUpArrow>
          <SelectPrimitive.List className="max-h-[inherit] overflow-y-auto p-1">{children}</SelectPrimitive.List>
          <SelectPrimitive.ScrollDownArrow className="flex h-6 cursor-default items-center justify-center bg-popover text-muted-foreground">
            <HugeiconsIcon aria-hidden="true" className="size-3.5" icon={ArrowDown01Icon} strokeWidth={1.5} />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "grid cursor-default grid-cols-[1rem_minmax(0,1fr)] items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-45 data-highlighted:bg-admin-reef data-highlighted:text-primary-foreground",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="col-start-1 text-current">
        <HugeiconsIcon aria-hidden="true" className="size-3.5" icon={CheckmarkCircle02Icon} strokeWidth={1.5} />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText className="col-start-2 truncate">{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

const SelectGroup = SelectPrimitive.Group
const SelectLabel = SelectPrimitive.Label
const SelectSeparator = SelectPrimitive.Separator

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue }
