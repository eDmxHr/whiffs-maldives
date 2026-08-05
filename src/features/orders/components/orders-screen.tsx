"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { Cancel01Icon, CheckmarkCircle02Icon, Invoice03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { EmptyState } from "@/components/common/empty-state"
import { LoadingState } from "@/components/common/loading-state"
import { SearchInput } from "@/components/common/search-input"
import { StatusBadge, type StatusBadgeConfig } from "@/components/common/status-badge"
import { AdminShell } from "@/components/layouts/admin-shell"
import { Inspector, PageWrapper, Toolbar } from "@/components/layouts/page"
import { Button } from "@/components/ui/button"
import { FormUpload } from "@/components/forms/form-upload"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { useBottles } from "@/features/catalog/hooks/use-catalog"
import { useOrderMutations, useOrders } from "@/features/orders/hooks/use-orders"
import { earliestAvailableBottle } from "@/lib/inventory"
import { readFileAsDataUrl } from "@/lib/files"
import { money } from "@/lib/money"
import type { Order, OrderStatus } from "@/types/orders"

export const orderStatusConfig: StatusBadgeConfig = {
  pending_payment: { label: "Pending payment", variant: "warning" },
  payment_confirmed: { label: "Payment confirmed", variant: "info" },
  preparing: { label: "Preparing", variant: "info" },
  ready: { label: "Ready", variant: "success" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "neutral" },
}

export const paymentStatusConfig: StatusBadgeConfig = {
  pending: { label: "Payment pending", variant: "warning" },
  paid: { label: "Paid", variant: "success" },
  failed: { label: "Payment failed", variant: "danger" },
  refunded: { label: "Refunded", variant: "neutral" },
}

type StatusFilter = "all" | OrderStatus

const statusFilterItems: Array<{ label: string; value: StatusFilter }> = [
  { label: "All statuses", value: "all" },
  { label: "Pending payment", value: "pending_payment" },
  { label: "Payment confirmed", value: "payment_confirmed" },
  { label: "Preparing", value: "preparing" },
  { label: "Ready", value: "ready" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
]

const ORDER_ACTIONS: Record<OrderStatus, Array<{ label: string; nextStatus: OrderStatus; variant: "default" | "destructive" }>> = {
  pending_payment: [
    { label: "Verify payment", nextStatus: "payment_confirmed", variant: "default" },
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
  return error && typeof error === "object" && "message" in error ? String((error as { message: unknown }).message) : fallback
}

type OrdersScreenProps = {
  user: { name: string; role: string }
}

export function OrdersScreen({ user }: OrdersScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [fulfillDrafts, setFulfillDrafts] = useState<Record<string, string>>({})
  const orders = useOrders()
  const bottles = useBottles()
  const mutations = useOrderMutations()
  const proofForm = useForm<ProofUploadForm>({ defaultValues: { file: null } })

  const visibleOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return (orders.data ?? []).filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      const searchableText = [order.orderNumber, order.customerName, order.customerPhone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return matchesStatus && (!query || searchableText.includes(query))
    })
  }, [orders.data, searchQuery, statusFilter])

  const selectedOrder: Order | undefined = orders.data?.find((order) => order.id === selectedOrderId)

  async function submitProof(values: ProofUploadForm) {
    if (!selectedOrder || !values.file) {
      setError("Choose an image of the payment proof first.")
      return
    }

    setError("")

    try {
      const publicUrl = await readFileAsDataUrl(values.file)
      await mutations.setPaymentProof.mutateAsync({ id: selectedOrder.id, publicUrl })
      proofForm.reset({ file: null })
      toast.add({ title: "Payment proof attached.", type: "success" })
    } catch (uploadError) {
      setError(mutationErrorMessage(uploadError, "Could not attach payment proof."))
    }
  }

  async function toggleChecklistItem(orderId: string, checklistItemId: string) {
    setError("")
    try {
      await mutations.toggleChecklistItem.mutateAsync({ id: orderId, checklistItemId })
    } catch (mutationError) {
      setError(mutationErrorMessage(mutationError, "Could not update the checklist."))
    }
  }

  async function recordFulfillment(orderId: string, itemId: string) {
    setError("")
    const draft = fulfillDrafts[itemId]
    const fulfilledQuantity = Number(draft)

    if (draft === undefined || Number.isNaN(fulfilledQuantity)) {
      setError("Enter a fulfilled quantity.")
      return
    }

    try {
      await mutations.recordPartialFulfillment.mutateAsync({ id: orderId, itemId, fulfilledQuantity })
      toast.add({ title: "Fulfillment recorded.", type: "success" })
    } catch (mutationError) {
      setError(mutationErrorMessage(mutationError, "Could not record fulfillment."))
    }
  }

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Orders" }]}
        title="Orders"
      >
        <div className="grid gap-5">
          <Toolbar>
            <SearchInput
              className="min-w-0"
              placeholder="Search by order number, customer, or phone"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <Select
              items={statusFilterItems}
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger className="md:w-56">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  {statusFilterItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Toolbar>

          {error ? (
            <div className="rounded-xl bg-admin-danger/12 px-4 py-3 text-sm font-medium text-admin-danger">{error}</div>
          ) : null}

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            {orders.isLoading ? (
              <LoadingState label="Loading orders..." />
            ) : visibleOrders.length ? (
              <div className="flex flex-col rounded-2xl bg-card p-2">
                <div className="flex-1 overflow-hidden rounded-xl bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-4">Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleOrders.map((order) => (
                        <TableRow
                          key={order.id}
                          className="cursor-pointer"
                          role="button"
                          tabIndex={0}
                          data-state={order.id === selectedOrderId ? "selected" : undefined}
                          onClick={() => setSelectedOrderId(order.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault()
                              setSelectedOrderId(order.id)
                            }
                          }}
                        >
                          <TableCell className="px-4 font-semibold text-foreground">{order.orderNumber}</TableCell>
                          <TableCell className="text-muted-foreground">{order.customerName}</TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} config={orderStatusConfig} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={order.paymentStatus} config={paymentStatusConfig} />
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">{money(order.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No orders found"
                description="Adjust the search or status filter to find an order."
                icon={Invoice03Icon}
              />
            )}

            <Inspector>
              <div className="px-3 pb-3 pt-2">
                <p className="text-xs font-semibold tracking-[0.18em] text-admin-champagne uppercase">
                  Inspector
                </p>
                <h2 className="mt-1 text-lg font-semibold">Order detail</h2>
              </div>
              <div className="flex flex-1 flex-col rounded-xl bg-background p-4 md:p-5">
                {selectedOrder ? (
                  <div className="divide-y divide-border text-sm">
                    <div className="flex items-start justify-between gap-3 pb-4">
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground">{selectedOrder.orderNumber}</div>
                        <div className="text-muted-foreground">{selectedOrder.customerName}</div>
                        <div className="text-muted-foreground">{selectedOrder.customerPhone}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={selectedOrder.status} config={orderStatusConfig} />
                        <StatusBadge status={selectedOrder.paymentStatus} config={paymentStatusConfig} />
                      </div>
                    </div>

                    <div className="py-4">
                      <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">Items</p>
                      <div className="mt-3 grid gap-3">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="grid gap-1.5">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-foreground">
                                {item.fragranceName} · {item.offeringName} × {item.quantity}
                              </span>
                              <span className="text-muted-foreground">{money(item.totalPrice)}</span>
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
                                      setFulfillDrafts((current) => ({ ...current, [item.id]: event.target.value }))
                                    }
                                  />
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    loading={mutations.recordPartialFulfillment.isPending}
                                    onClick={() => recordFulfillment(selectedOrder.id, item.id)}
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

                    {selectedOrder.status === "payment_confirmed" || selectedOrder.status === "preparing" ? (
                      <div className="py-4">
                        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                          Bottle allocation preview
                        </p>
                        <div className="mt-3 grid gap-2">
                          {selectedOrder.items.map((item) => {
                            const bottle = earliestAvailableBottle(bottles.data ?? [], item.fragranceId)
                            return (
                              <div key={item.id} className="flex items-center justify-between gap-3">
                                <span className="text-foreground">{item.offeringName}</span>
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

                    {selectedOrder.status === "preparing" || selectedOrder.status === "ready" || selectedOrder.status === "completed" ? (
                      <div className="py-4">
                        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                          Fulfillment checklist
                        </p>
                        <div className="mt-3 grid gap-2">
                          {selectedOrder.fulfillmentChecklist.map((checklistItem) => (
                            <Button
                              key={checklistItem.id}
                              type="button"
                              size="sm"
                              variant={checklistItem.done ? "secondary" : "outline"}
                              className="justify-start"
                              onClick={() => toggleChecklistItem(selectedOrder.id, checklistItem.id)}
                            >
                              <HugeiconsIcon
                                aria-hidden="true"
                                data-icon="inline-start"
                                icon={CheckmarkCircle02Icon}
                                strokeWidth={1.5}
                              />
                              {checklistItem.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="py-4">
                      <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">Payment proof</p>
                      <div className="mt-3 grid gap-3">
                        {selectedOrder.paymentProofUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt="Payment proof"
                            src={selectedOrder.paymentProofUrl}
                            className="h-32 w-full rounded-lg border border-border object-cover"
                          />
                        ) : (
                          <p className="text-muted-foreground">No proof attached yet.</p>
                        )}
                        <form className="flex items-end gap-2" onSubmit={proofForm.handleSubmit(submitProof)}>
                          <FormUpload control={proofForm.control} name="file" label="Attach proof" accept="image/*" />
                          <Button size="sm" type="submit" loading={mutations.setPaymentProof.isPending} loadingText="Uploading...">
                            Upload
                          </Button>
                        </form>
                      </div>
                    </div>

                    <div className="py-4">
                      <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">Delivery</p>
                      <div className="mt-3 grid gap-1 text-muted-foreground">
                        <span>{selectedOrder.deliveryMethod}</span>
                        {selectedOrder.deliveryAddress ? <span>{selectedOrder.deliveryAddress}</span> : null}
                      </div>
                    </div>

                    <div className="py-4">
                      <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">Total</p>
                      <div className="mt-3 grid gap-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="text-foreground">{money(selectedOrder.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivery fee</span>
                          <span className="text-foreground">{money(selectedOrder.deliveryFee)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-foreground">Total</span>
                          <span className="text-foreground">{money(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </div>

                    {ORDER_ACTIONS[selectedOrder.status].length ? (
                      <div className="flex flex-wrap gap-2 pt-4">
                        {ORDER_ACTIONS[selectedOrder.status].map((action) => (
                          <Button
                            key={action.nextStatus}
                            size="sm"
                            variant={action.variant}
                            loading={mutations.updateStatus.isPending}
                            onClick={() =>
                              mutations.updateStatus.mutate({ id: selectedOrder.id, status: action.nextStatus })
                            }
                          >
                            <HugeiconsIcon
                              aria-hidden="true"
                              data-icon="inline-start"
                              icon={action.nextStatus === "cancelled" ? Cancel01Icon : CheckmarkCircle02Icon}
                              strokeWidth={1.5}
                            />
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <EmptyState
                    title="No order selected"
                    description="Select an order from the list to review payment and fulfillment details."
                    icon={Invoice03Icon}
                    surface="plain"
                  />
                )}
              </div>
            </Inspector>
          </div>
        </div>
      </PageWrapper>
    </AdminShell>
  )
}
