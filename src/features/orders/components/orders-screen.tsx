"use client"

import { useMemo, useState } from "react"
import { Cancel01Icon, CheckmarkCircle02Icon, Invoice03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { EmptyState } from "@/components/common/empty-state"
import { LoadingState } from "@/components/common/loading-state"
import { SearchInput } from "@/components/common/search-input"
import { StatusBadge, type StatusBadgeConfig } from "@/components/common/status-badge"
import { AdminShell } from "@/components/layouts/admin-shell"
import { Inspector, PageWrapper, Toolbar } from "@/components/layouts/page"
import { Button } from "@/components/ui/button"
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
import { useOrderMutations, useOrders } from "@/features/orders/hooks/use-orders"
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

type OrdersScreenProps = {
  user: { name: string; role: string }
}

export function OrdersScreen({ user }: OrdersScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const orders = useOrders()
  const mutations = useOrderMutations()

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
                      <div className="mt-3 grid gap-2">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-3">
                            <span className="text-foreground">
                              {item.fragranceName} · {item.offeringName} × {item.quantity}
                            </span>
                            <span className="text-muted-foreground">{money(item.totalPrice)}</span>
                          </div>
                        ))}
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
