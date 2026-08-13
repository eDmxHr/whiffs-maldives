"use client"

import Link from "next/link"

import { CartLineItem } from "@/components/cart/cart-line-item"
import { EmptyState } from "@/components/common/empty-state"
import { Container, Section } from "@/components/layouts/container"
import { buttonVariants } from "@/components/ui/button"
import { cartSubtotal, useCartStore } from "@/stores/cart-store"
import { money } from "@/lib/money"
import { cn } from "@/lib/utils"

export default function CartPage() {
  const lines = useCartStore((state) => state.lines)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeLine = useCartStore((state) => state.removeLine)

  return (
    <Section bordered={false}>
      <Container className="py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">Your cart</p>
        <h1 className="mt-2 font-heading text-4xl font-semibold">
          {lines.length === 0 ? "Nothing here yet" : `${lines.length} fragrance${lines.length > 1 ? "s" : ""} selected`}
        </h1>

        {lines.length === 0 ? (
          <EmptyState
            action={
              <Link className={buttonVariants({ variant: "luxury" })} href="/">
                Browse fragrances
              </Link>
            }
            className="mt-8"
            description="Add a decant from the collection to start your order."
            title="Your cart is empty"
          />
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-[1.4fr_1fr]">
            <div className="grid gap-3">
              {lines.map((line) => (
                <CartLineItem key={line.offeringId} line={line} onQuantityChange={updateQuantity} onRemove={removeLine} />
              ))}
            </div>

            <div className="h-fit rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{money(cartSubtotal(lines))}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Delivery fee calculated at checkout.</p>
              <Link className={cn(buttonVariants({ variant: "luxury" }), "mt-5 w-full")} href="/checkout">
                Checkout
              </Link>
            </div>
          </div>
        )}
      </Container>
    </Section>
  )
}
