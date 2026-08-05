"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import {
  ArrowLeft02Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Invoice03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { EmptyState } from "@/components/common/empty-state"
import { LoadingState } from "@/components/common/loading-state"
import { StatusBadge } from "@/components/common/status-badge"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper, SectionWrapper } from "@/components/layouts/page"
import { Button, buttonVariants } from "@/components/ui/button"
import { FormUpload } from "@/components/forms/form-upload"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { useBottles } from "@/features/catalog/hooks/use-catalog"
import {
  orderStatusConfig,
  paymentStatusConfig,
} from "@/features/orders/components/orders-screen"
import { useOrderMutations, useOrder } from "@/features/orders/hooks/use-orders"
import { formatDateTime } from "@/lib/datetime"
import { earliestAvailableBottle } from "@/lib/inventory"
import { readFileAsDataUrl } from "@/lib/files"
import { money } from "@/lib/money"
import type { OrderStatus } from "@/types/orders"

const ORDER_ACTIONS: Record<
  OrderStatus,
  Array<{
    label: string
    nextStatus: OrderStatus
    variant: "default" | "destructive"
  }>
> = {
  pending_payment: [
    {
      label: "Verify payment",
      nextStatus: "payment_confirmed",
      variant: "default",
    },
    { label: "Cancel order", nextStatus: "cancelled", variant: "destructive" },
  ],
  payment_confirmed: [
    { label: "Start preparation", nextStatus: "preparing", variant: "default" },
    { label: "Cancel order", nextStatus: "cancelled", variant: "destructive" },
  ],
  preparing: [
    { label: "Mark ready", nextStatus: "ready", variant: "default" },
    { label: "Cancel order", nextStatus: "cancelled", variant: "destructive" },
  ],
  ready: [
    { label: "Mark delivered", nextStatus: "completed", variant: "default" },
    { label: "Cancel order", nextStatus: "cancelled", variant: "destructive" },
  ],
  completed: [],
  cancelled: [],
}

type ProofUploadForm = { file: File | null }

function mutationErrorMessage(error: unknown, fallback: string) {
  return error && typeof error === "object" && "message" in error
    ? String((error as { message: unknown }).message)
    : fallback
}

type OrderDetailScreenProps = {
  user: { name: string; role: string }
  orderId: string
}

export function OrderDetailScreen({ user, orderId }: OrderDetailScreenProps) {
  const order = useOrder(orderId)
  const bottles = useBottles()
  const mutations = useOrderMutations()
  const [error, setError] = useState("")
  const [fulfillDrafts, setFulfillDrafts] = useState<Record<string, string>>({})
  const proofForm = useForm<ProofUploadForm>({ defaultValues: { file: null } })

  const selectedOrder = order.data

  async function submitProof(values: ProofUploadForm) {
    if (!selectedOrder || !values.file) {
      setError("Choose an image of the payment proof first.")
      return
    }

    setError("")

    try {
      const publicUrl = await readFileAsDataUrl(values.file)
      await mutations.setPaymentProof.mutateAsync({
        id: selectedOrder.id,
        publicUrl,
      })
      proofForm.reset({ file: null })
      toast.add({ title: "Payment proof attached.", type: "success" })
    } catch (uploadError) {
      setError(
        mutationErrorMessage(uploadError, "Could not attach payment proof.")
      )
    }
  }

  async function toggleChecklistItem(checklistItemId: string) {
    if (!selectedOrder) return
    setError("")
    try {
      await mutations.toggleChecklistItem.mutateAsync({
        id: selectedOrder.id,
        checklistItemId,
      })
    } catch (mutationError) {
      setError(
        mutationErrorMessage(mutationError, "Could not update the checklist.")
      )
    }
  }

  async function recordFulfillment(itemId: string) {
    if (!selectedOrder) return
    setError("")
    const draft = fulfillDrafts[itemId]
    const fulfilledQuantity = Number(draft)

    if (draft === undefined || Number.isNaN(fulfilledQuantity)) {
      setError("Enter a fulfilled quantity.")
      return
    }

    try {
      await mutations.recordPartialFulfillment.mutateAsync({
        id: selectedOrder.id,
        itemId,
        fulfilledQuantity,
      })
      toast.add({ title: "Fulfillment recorded.", type: "success" })
    } catch (mutationError) {
      setError(
        mutationErrorMessage(mutationError, "Could not record fulfillment.")
      )
    }
  }

  const backAction = (
    <Link className={buttonVariants({ variant: "outline" })} href="/admin/orders">
      <HugeiconsIcon
        aria-hidden="true"
        data-icon="inline-start"
        icon={ArrowLeft02Icon}
        strokeWidth={1.5}
      />
      Back to orders
    </Link>
  )

  const actions = selectedOrder ? ORDER_ACTIONS[selectedOrder.status] : []
  const showBottleAllocation =
    selectedOrder?.status === "payment_confirmed" ||
    selectedOrder?.status === "preparing"
  const showChecklist =
    selectedOrder?.status === "preparing" ||
    selectedOrder?.status === "ready" ||
    selectedOrder?.status === "completed"

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Orders", href: "/admin/orders" },
          { label: selectedOrder?.orderNumber ?? "Order" },
        ]}
        title={selectedOrder?.orderNumber ?? "Order"}
        actions={backAction}
      >
        {order.isLoading ? (
          <LoadingState label="Loading order..." />
        ) : selectedOrder ? (
          <div className="grid gap-5">
            {error ? (
              <div className="rounded-xl bg-admin-danger/12 px-4 py-3 text-sm font-medium text-admin-danger">
                {error}
              </div>
            ) : null}

            <SectionWrapper
              headerEyebrow="Orders"
              title="Order"
              icon={
                <HugeiconsIcon
                  aria-hidden="true"
                  className="size-5 text-admin-reef"
                  icon={Invoice03Icon}
                  strokeWidth={1.5}
                />
              }
            >
              <div className="divide-y divide-border text-sm">
                <div className="flex flex-col items-start justify-between gap-4 pb-5 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">
                      {selectedOrder.customerName}
                    </div>
                    <div className="text-muted-foreground">
                      {selectedOrder.customerPhone}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Placed {formatDateTime(selectedOrder.createdAt)}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge
                        status={selectedOrder.status}
                        config={orderStatusConfig}
                      />
                      <StatusBadge
                        status={selectedOrder.paymentStatus}
                        config={paymentStatusConfig}
                      />
                    </div>
                    {actions.length ? (
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        {actions.map((action) => (
                          <Button
                            key={action.nextStatus}
                            size="sm"
                            variant={action.variant}
                            loading={mutations.updateStatus.isPending}
                            onClick={() =>
                              mutations.updateStatus.mutate({
                                id: selectedOrder.id,
                                status: action.nextStatus,
                              })
                            }
                          >
                            <HugeiconsIcon
                              aria-hidden="true"
                              data-icon="inline-start"
                              icon={
                                action.nextStatus === "cancelled"
                                  ? Cancel01Icon
                                  : CheckmarkCircle02Icon
                              }
                              strokeWidth={1.5}
                            />
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="py-5">
                  <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    Items
                  </p>
                  <div className="mt-3 grid gap-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="grid gap-1.5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-foreground">
                            {item.fragranceName} · {item.offeringName} ×{" "}
                            {item.quantity}
                          </span>
                          <span className="text-muted-foreground">
                            {money(item.totalPrice)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                          <span>
                            Fulfilled {item.fulfilledQuantity}/{item.quantity}
                          </span>
                          {selectedOrder.status === "preparing" ? (
                            <div className="flex items-center gap-2">
                              <Input
                                className="h-8 w-16"
                                type="number"
                                min={0}
                                max={item.quantity}
                                placeholder={String(item.fulfilledQuantity)}
                                value={fulfillDrafts[item.id] ?? ""}
                                onChange={(event) =>
                                  setFulfillDrafts((current) => ({
                                    ...current,
                                    [item.id]: event.target.value,
                                  }))
                                }
                              />
                              <Button
                                size="xs"
                                variant="outline"
                                loading={
                                  mutations.recordPartialFulfillment.isPending
                                }
                                onClick={() => recordFulfillment(item.id)}
                              >
                                Update
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {showBottleAllocation ? (
                  <div className="py-5">
                    <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      Bottle allocation preview
                    </p>
                    <div className="mt-3 grid gap-2">
                      {selectedOrder.items.map((item) => {
                        const bottle = earliestAvailableBottle(
                          bottles.data ?? [],
                          item.fragranceId
                        )
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3"
                          >
                            <span className="text-foreground">
                              {item.offeringName}
                            </span>
                            <span className="text-muted-foreground">
                              {bottle
                                ? `Bottle ${bottle.id.slice(-4)} · ${bottle.remainingVolumeMl}ml left`
                                : "No bottle available"}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                {showChecklist ? (
                  <div className="py-5">
                    <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      Fulfillment checklist
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {selectedOrder.fulfillmentChecklist.map(
                        (checklistItem) => (
                          <Button
                            key={checklistItem.id}
                            type="button"
                            size="sm"
                            variant={
                              checklistItem.done ? "secondary" : "outline"
                            }
                            className="justify-start"
                            onClick={() =>
                              toggleChecklistItem(checklistItem.id)
                            }
                          >
                            <HugeiconsIcon
                              aria-hidden="true"
                              data-icon="inline-start"
                              icon={CheckmarkCircle02Icon}
                              strokeWidth={1.5}
                            />
                            {checklistItem.label}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-5 py-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      Payment proof
                    </p>
                    <div className="mt-3 grid gap-3">
                      {selectedOrder.paymentProofUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt="Payment proof"
                          src={selectedOrder.paymentProofUrl}
                          className="h-32 w-full rounded-lg border border-border object-cover"
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          No proof attached yet.
                        </p>
                      )}
                      <form
                        className="flex flex-col gap-2"
                        onSubmit={proofForm.handleSubmit(submitProof)}
                      >
                        <FormUpload
                          control={proofForm.control}
                          name="file"
                          label="Attach proof"
                          accept="image/*"
                        />
                        <Button
                          size="sm"
                          type="submit"
                          loading={mutations.setPaymentProof.isPending}
                          loadingText="Uploading..."
                        >
                          Upload
                        </Button>
                      </form>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      Delivery
                    </p>
                    <div className="mt-3 grid gap-1 text-muted-foreground">
                      <span>{selectedOrder.deliveryMethod}</span>
                      {selectedOrder.deliveryAddress ? (
                        <span>{selectedOrder.deliveryAddress}</span>
                      ) : null}
                    </div>

                    <p className="mt-5 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      Total
                    </p>
                    <div className="mt-3 grid gap-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Subtotal
                        </span>
                        <span className="text-foreground">
                          {money(selectedOrder.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Delivery fee
                        </span>
                        <span className="text-foreground">
                          {money(selectedOrder.deliveryFee)}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-foreground">Total</span>
                        <span className="text-foreground">
                          {money(selectedOrder.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionWrapper>
          </div>
        ) : (
          <EmptyState
            title="Order not found"
            description="This order may have been removed. Return to the order list to keep browsing."
            icon={Invoice03Icon}
            action={backAction}
          />
        )}
      </PageWrapper>
    </AdminShell>
  )
}
