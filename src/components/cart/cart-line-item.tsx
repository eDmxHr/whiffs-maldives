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
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3">
      {line.heroImageUrl ? (
        <img className="size-16 shrink-0 rounded-lg object-cover" src={line.heroImageUrl} alt="" />
      ) : (
        <div className="size-16 shrink-0 rounded-lg bg-admin-reef" />
      )}

      <div className="min-w-0 flex-1">
        <div className="text-xs text-admin-champagne-deep">{line.brandName}</div>
        <div className="truncate font-medium">{line.fragranceName}</div>
        <div className="text-xs text-muted-foreground">{line.sizeMl} ml decant</div>

        <div className="mt-2 flex items-center justify-between">
          {readOnly ? (
            <span className="text-sm text-muted-foreground">Qty {line.quantity}</span>
          ) : (
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
          )}

          <span className="font-semibold">{money(line.price * line.quantity)}</span>
        </div>
      </div>

      {!readOnly && (
        <Button
          aria-label="Remove from cart"
          className="self-start text-muted-foreground"
          onClick={() => onRemove?.(line.offeringId)}
          size="icon-xs"
          variant="ghost"
        >
          <HugeiconsIcon icon={Remove01Icon} strokeWidth={1.5} />
        </Button>
      )}
    </div>
  )
}
