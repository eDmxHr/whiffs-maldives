"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { Container, Section } from "@/components/layouts/container"
import { CheckoutForm } from "@/features/checkout/components/checkout-form"
import { useCartHydrated, useCartStore } from "@/stores/cart-store"

export default function CheckoutPage() {
  const router = useRouter()
  const lines = useCartStore((state) => state.lines)
  const hydrated = useCartHydrated()

  useEffect(() => {
    if (hydrated && lines.length === 0) {
      router.replace("/cart")
    }
  }, [hydrated, lines.length, router])

  if (!hydrated || lines.length === 0) {
    return null
  }

  return (
    <Section bordered={false}>
      <Container className="py-12 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-admin-champagne">Checkout</p>
        <h1 className="mt-2 font-heading text-4xl font-semibold">Complete your order</h1>

        <div className="mt-8">
          <CheckoutForm />
        </div>
      </Container>
    </Section>
  )
}
