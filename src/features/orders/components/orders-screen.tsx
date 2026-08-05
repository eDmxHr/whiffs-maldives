"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Invoice03Icon } from "@hugeicons/core-free-icons"

import { EmptyState } from "@/components/common/empty-state"
import { LoadingState } from "@/components/common/loading-state"
import { SearchInput } from "@/components/common/search-input"
import {
  StatusBadge,
  type StatusBadgeConfig,
} from "@/components/common/status-badge"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper, Toolbar } from "@/components/layouts/page"
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
import { useOrders } from "@/features/orders/hooks/use-orders"
import { money } from "@/lib/money"
import type { OrderStatus } from "@/types/orders"

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

type OrdersScreenProps = {
  user: { name: string; role: string }
}

export function OrdersScreen({ user }: OrdersScreenProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const orders = useOrders()

  const visibleOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return (orders.data ?? []).filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter
      const searchableText = [
        order.orderNumber,
        order.customerName,
        order.customerPhone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return matchesStatus && (!query || searchableText.includes(query))
    })
  }, [orders.data, searchQuery, statusFilter])

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
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            router.push(`/admin/orders/${order.id}`)
                          }
                        }}
                      >
                        <TableCell className="px-4 font-semibold text-foreground">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {order.customerName}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={order.status}
                            config={orderStatusConfig}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={order.paymentStatus}
                            config={paymentStatusConfig}
                          />
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {money(order.total)}
                        </TableCell>
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
        </div>
      </PageWrapper>
    </AdminShell>
  )
}
