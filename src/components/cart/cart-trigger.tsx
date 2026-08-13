"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { ShoppingBag01Icon } from "@hugeicons/core-free-icons"

import { CartDrawerContent } from "@/components/cart/cart-drawer"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cartQuantity, useCartStore } from "@/stores/cart-store"

export function CartTrigger() {
  const quantity = useCartStore((state) => cartQuantity(state.lines))

  return (
    <Sheet>
      <SheetTrigger
        aria-label="View cart"
        className="relative flex size-10 items-center justify-center rounded-lg text-foreground transition hover:bg-muted"
      >
        <HugeiconsIcon aria-hidden="true" className="size-5" icon={ShoppingBag01Icon} strokeWidth={1.5} />
        {quantity > 0 ? (
          <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-admin-reef text-[10px] font-semibold text-white">
            {quantity > 9 ? "9+" : quantity}
          </span>
        ) : null}
      </SheetTrigger>
      <SheetContent className="gap-0 p-0">
        <CartDrawerContent />
      </SheetContent>
    </Sheet>
  )
}
