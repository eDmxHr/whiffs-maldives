"use client"

import Link from "next/link"

import { CartLineItem } from "@/components/cart/cart-line-item"
import { EmptyState } from "@/components/common/empty-state"
import { buttonVariants } from "@/components/ui/button"
import { SheetClose, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cartSubtotal, useCartStore } from "@/stores/cart-store"
import { money } from "@/lib/money"
import { cn } from "@/lib/utils"

export function CartDrawerContent() {
  const lines = useCartStore((state) => state.lines)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeLine = useCartStore((state) => state.removeLine)

  return (
    <>
      <SheetHeader>
        <SheetTitle>Your cart</SheetTitle>
        <SheetDescription>{lines.length === 0 ? "No items yet." : `${lines.length} fragrance${lines.length > 1 ? "s" : ""} selected`}</SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-4">
        {lines.length === 0 ? (
          <EmptyState
            description="Browse the collection and add a decant to get started."
            surface="plain"
            title="Your cart is empty"
          />
        ) : (
          <div className="grid gap-3 pb-4">
            {lines.map((line) => (
              <CartLineItem key={line.offeringId} line={line} onQuantityChange={updateQuantity} onRemove={removeLine} />
            ))}
          </div>
        )}
      </div>

      {lines.length > 0 ? (
        <SheetFooter className="border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{money(cartSubtotal(lines))}</span>
          </div>
          <SheetClose render={<Link className={cn(buttonVariants({ variant: "luxury" }))} href="/checkout" />}>
            Checkout
          </SheetClose>
          <SheetClose render={<Link className={buttonVariants({ variant: "ghost" })} href="/cart" />}>View cart</SheetClose>
        </SheetFooter>
      ) : null}
    </>
  )
}
