"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { CartLineItem } from "@/components/cart/cart-line-item"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { FormInput } from "@/components/forms/form-input"
import { FormSelect } from "@/components/forms/form-select"
import { FormTextarea } from "@/components/forms/form-textarea"
import { useCheckoutMutation } from "@/features/checkout/hooks/use-checkout"
import { cartSubtotal, useCartStore } from "@/stores/cart-store"
import { mutationErrorMessage } from "@/lib/errors"
import { money } from "@/lib/money"

type CheckoutFormValues = {
  customerName: string
  customerPhone: string
  customerEmail: string
  deliveryMethod: string
  deliveryAddress: string
  notes: string
  paymentMethod: "bank_transfer" | "cod"
}

const deliveryMethodItems = [
  { label: "Malé delivery", value: "male_delivery" },
  { label: "Island delivery", value: "island_delivery" },
]

const paymentMethodItems = [
  { label: "Bank transfer", value: "bank_transfer" },
  { label: "Cash on delivery", value: "cod" },
]

export function CheckoutForm() {
  const router = useRouter()
  const lines = useCartStore((state) => state.lines)
  const clearCart = useCartStore((state) => state.clear)
  const checkout = useCheckoutMutation()

  const form = useForm<CheckoutFormValues>({
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      deliveryMethod: "male_delivery",
      deliveryAddress: "",
      notes: "",
      paymentMethod: "bank_transfer",
    },
  })

  async function onSubmit(values: CheckoutFormValues) {
    try {
      const order = await checkout.mutateAsync({
        ...values,
        items: lines.map((line) => ({
          fragranceId: line.fragranceId,
          offeringId: line.offeringId,
          quantity: line.quantity,
        })),
      })

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(`whiffs-order-${order.orderNumber}`, JSON.stringify(order))
      }

      clearCart()
      router.push(`/order-confirmation/${order.orderNumber}`)
    } catch (error) {
      toast.add({ title: "Could not place order", description: mutationErrorMessage(error, "Please try again."), type: "error" })
    }
  }

  return (
    <form className="grid gap-8 md:grid-cols-[1.4fr_1fr]" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-6">
        <div className="grid gap-4 rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-lg font-semibold">Contact details</h2>
          <FormInput control={form.control} label="Full name" name="customerName" rules={{ required: "Name is required" }} />
          <FormInput control={form.control} label="Phone number" name="customerPhone" rules={{ required: "Phone number is required" }} type="tel" />
          <FormInput control={form.control} label="Email (optional)" name="customerEmail" type="email" />
        </div>

        <div className="grid gap-4 rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-lg font-semibold">Delivery</h2>
          <FormSelect
            control={form.control}
            items={deliveryMethodItems}
            label="Delivery method"
            name="deliveryMethod"
            rules={{ required: "Select a delivery method" }}
          />
          <FormTextarea
            control={form.control}
            label="Delivery address"
            name="deliveryAddress"
            placeholder="Street, island, atoll"
            rules={{ required: "Delivery address is required" }}
          />
          <FormTextarea control={form.control} label="Notes (optional)" name="notes" placeholder="Delivery instructions, gate code, etc." />
        </div>

        <div className="grid gap-4 rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-lg font-semibold">Payment</h2>
          <FormSelect
            control={form.control}
            items={paymentMethodItems}
            label="Payment method"
            name="paymentMethod"
            rules={{ required: "Select a payment method" }}
          />
          <p className="text-xs text-muted-foreground">
            Bank transfer orders are held for a limited time pending payment confirmation. Cash on delivery is paid when your order
            arrives.
          </p>
        </div>
      </div>

      <div className="h-fit grid gap-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading text-lg font-semibold">Order review</h2>
        <div className="grid gap-3">
          {lines.map((line) => (
            <CartLineItem key={line.offeringId} line={line} readOnly />
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">{money(cartSubtotal(lines))}</span>
        </div>
        <p className="text-xs text-muted-foreground">Delivery fee, if any, is confirmed after checkout.</p>
        <Button loading={checkout.isPending} loadingText="Placing order..." type="submit" variant="luxury">
          Place order
        </Button>
      </div>
    </form>
  )
}
