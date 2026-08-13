"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BankIcon,
  CheckmarkCircle02Icon,
  DeliveryTruck01Icon,
} from "@hugeicons/core-free-icons"

import { Container, Section } from "@/components/layouts/container"
import { buttonVariants } from "@/components/ui/button"
import type { GuestOrderConfirmation } from "@/types/orders"
import { formatDateTime } from "@/lib/datetime"
import { money } from "@/lib/money"

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = use(params)
  const [order, setOrder] = useState<GuestOrderConfirmation | null | undefined>(
    undefined
  )

  useEffect(() => {
    // sessionStorage is only available client-side; this has to run post-mount to stay
    // SSR-safe, so the deferred setState here is intentional rather than an anti-pattern.
    const raw = window.sessionStorage.getItem(`whiffs-order-${orderNumber}`)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(raw ? (JSON.parse(raw) as GuestOrderConfirmation) : null)
  }, [orderNumber])

  if (order === undefined) {
    return null
  }

  if (order === null) {
    return (
      <Section bordered={false}>
        <Container className="py-16 text-center">
          <h1 className="font-heading text-3xl font-semibold">
            We couldn&apos;t find that order
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This confirmation is only available right after checkout. If you
            already placed an order, hold on to your order number — our team
            will be in touch to confirm payment.
          </p>
          <Link
            className={buttonVariants({ variant: "luxury", className: "mt-6" })}
            href="/"
          >
            Back to fragrances
          </Link>
        </Container>
      </Section>
    )
  }

  return (
    <Section bordered={false}>
      <Container className="max-w-2xl py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-admin-success/12 text-admin-success">
          <HugeiconsIcon
            aria-hidden="true"
            className="size-7"
            icon={CheckmarkCircle02Icon}
            strokeWidth={1.5}
          />
        </div>
        <p className="mt-6 text-xs font-semibold tracking-widest text-admin-champagne uppercase">
          Order placed
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold">
          Order {order.orderNumber}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Thank you — we&apos;ve received your order for {money(order.total)}.
          Our team will confirm your payment before preparing it.
        </p>

        <div className="mt-8 grid gap-3 rounded-xl border border-border bg-card p-6 text-left">
          {order.paymentMethod === "bank_transfer" ? (
            <>
              <div className="flex items-center gap-2 font-medium">
                <HugeiconsIcon
                  className="size-5 text-admin-reef"
                  icon={BankIcon}
                  strokeWidth={1.5}
                />
                Pay by bank transfer
              </div>
              <p className="text-sm text-muted-foreground">
                Transfer {money(order.total)} to Whiffs Maldives, Bank of
                Maldives, account 7701-234567-001, using your order number (
                {order.orderNumber}) as the reference.
              </p>
              {order.paymentExpiresAt ? (
                <p className="text-sm font-medium text-admin-warning">
                  Please complete payment by{" "}
                  {formatDateTime(order.paymentExpiresAt)}, or the order may be
                  released.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 font-medium">
                <HugeiconsIcon
                  className="size-5 text-admin-reef"
                  icon={DeliveryTruck01Icon}
                  strokeWidth={1.5}
                />
                Cash on delivery
              </div>
              <p className="text-sm text-muted-foreground">
                Have {money(order.total)} ready when your order arrives at{" "}
                {order.deliveryAddress || "your delivery address"}.
              </p>
            </>
          )}
        </div>

        <Link
          className={buttonVariants({ variant: "outline", className: "mt-8" })}
          href="/"
        >
          Continue browsing
        </Link>
      </Container>
    </Section>
  )
}
