/* eslint-disable @next/next/no-img-element */

import { HugeiconsIcon } from "@hugeicons/react"
import { MinusSignIcon, PlusSignIcon, Remove01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import type { CartLine } from "@/stores/cart-store"
import { money } from "@/lib/money"

type CartLineItemProps = {
  line: CartLine
  onQuantityChange?: (offeringId: string, quantity: number) => void
  onRemove?: (offeringId: string) => void
  readOnly?: boolean
}

export function CartLineItem({ line, onQuantityChange, onRemove, readOnly = false }: CartLineItemProps) {
  if (readOnly) {
    return (
      <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0 last:pb-0">
        <div className="flex min-w-0 items-center gap-3">
          {line.heroImageUrl ? (
            <img className="size-12 shrink-0 rounded-lg object-cover" src={line.heroImageUrl} alt="" />
          ) : (
            <div className="size-12 shrink-0 rounded-lg bg-admin-reef" />
          )}

          <div className="min-w-0">
            <div className="truncate text-sm font-medium">
              {line.fragranceName} <span className="font-normal text-muted-foreground">× {line.quantity}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {line.brandName} · {line.sizeMl} ml decant
            </div>
          </div>
        </div>

        <div className="shrink-0 text-sm font-semibold">{money(line.price * line.quantity)}</div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3">
      {line.heroImageUrl ? (
        <img className="size-12 shrink-0 rounded-lg object-cover" src={line.heroImageUrl} alt="" />
      ) : (
        <div className="size-12 shrink-0 rounded-lg bg-admin-reef" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 truncate text-sm font-medium">{line.fragranceName}</div>
          <span className="shrink-0 text-sm font-semibold">{money(line.price * line.quantity)}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {line.brandName} · {line.sizeMl} ml decant
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              aria-label="Decrease quantity"
              onClick={() => onQuantityChange?.(line.offeringId, line.quantity - 1)}
              size="icon-xs"
              variant="outline"
            >
              <HugeiconsIcon icon={MinusSignIcon} strokeWidth={1.5} />
            </Button>
            <span className="w-6 text-center text-sm font-medium">{line.quantity}</span>
            <Button
              aria-label="Increase quantity"
              onClick={() => onQuantityChange?.(line.offeringId, line.quantity + 1)}
              size="icon-xs"
              variant="outline"
            >
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={1.5} />
            </Button>
          </div>

          <Button
            aria-label="Remove from cart"
            className="text-muted-foreground"
            onClick={() => onRemove?.(line.offeringId)}
            size="icon-xs"
            variant="ghost"
          >
            <HugeiconsIcon icon={Remove01Icon} strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  )
}
