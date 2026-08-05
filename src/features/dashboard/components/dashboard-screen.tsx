"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  Activity01Icon,
  AlertCircleIcon,
  InboxIcon,
  Invoice03Icon,
  MilkBottleIcon,
  Package02Icon,
  PerfumeIcon,
  UserGroup02Icon,
} from "@hugeicons/core-free-icons"
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js"
import { Bar } from "react-chartjs-2"

import { EmptyState } from "@/components/common/empty-state"
import { MetricCard } from "@/components/common/metric-card"
import {
  StatusBadge,
  type StatusBadgeConfig,
} from "@/components/common/status-badge"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper, SectionWrapper } from "@/components/layouts/page"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useBottles,
  useFragrances,
  useSuppliers,
} from "@/features/catalog/hooks/use-catalog"
import { orderStatusConfig } from "@/features/orders/components/orders-screen"
import { useOrders } from "@/features/orders/hooks/use-orders"
import { usePackagingItems } from "@/features/packaging/hooks/use-packaging"
import { formatDateTime } from "@/lib/datetime"
import { money } from "@/lib/money"
import { salesByDay as computeSalesByDay, startOfDay } from "@/lib/reports"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

type DashboardScreenProps = {
  user: { name: string; role: string }
}

type InboxCategory = "urgent" | "action_required" | "needs_review"

const inboxCategoryConfig: StatusBadgeConfig = {
  urgent: { label: "Urgent", variant: "danger" },
  action_required: { label: "Action required", variant: "warning" },
  needs_review: { label: "Needs review", variant: "info" },
}

export function DashboardScreen({ user }: DashboardScreenProps) {
  const fragrances = useFragrances()
  const bottles = useBottles()
  const suppliers = useSuppliers()
  const orders = useOrders()
  const packagingItems = usePackagingItems()

  const lowStockPackaging = useMemo(
    () =>
      (packagingItems.data ?? []).filter(
        (item) => item.quantity <= item.minimumQuantity
      ),
    [packagingItems.data]
  )

  const draftCount =
    fragrances.data?.filter((fragrance) => fragrance.status === "draft")
      .length ?? 0
  const availableBottleCount =
    bottles.data?.filter((bottle) => bottle.status === "available").length ?? 0
  const lowVolumeBottles = useMemo(
    () =>
      bottles.data?.filter((bottle) => bottle.status === "low_volume") ?? [],
    [bottles.data]
  )

  const metrics = useMemo(() => {
    const allOrders = orders.data ?? []
    const today = startOfDay(new Date())
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const ordersToday = allOrders.filter(
      (order) => new Date(order.createdAt) >= today
    )
    const ordersThisMonth = allOrders.filter(
      (order) => new Date(order.createdAt) >= startOfMonth
    )
    const paidOrders = allOrders.filter(
      (order) => order.paymentStatus === "paid"
    )
    const revenueThisMonth = ordersThisMonth
      .filter((order) => order.paymentStatus === "paid")
      .reduce((sum, order) => sum + order.total, 0)
    const averageOrderValue = paidOrders.length
      ? paidOrders.reduce((sum, o) => sum + o.total, 0) / paidOrders.length
      : 0
    const pendingPaymentsCount = allOrders.filter(
      (order) => order.paymentStatus === "pending"
    ).length

    return {
      ordersTodayCount: ordersToday.length,
      revenueThisMonth,
      averageOrderValue,
      pendingPaymentsCount,
    }
  }, [orders.data])

  const salesByDay = useMemo(() => computeSalesByDay(orders.data ?? [], 14), [orders.data])

  const inboxItems = useMemo(() => {
    const items: Array<{
      id: string
      category: InboxCategory
      title: string
      href: string
    }> = []

    for (const order of orders.data ?? []) {
      if (order.status === "pending_payment") {
        items.push({
          id: `order-payment-${order.id}`,
          category: "urgent",
          title: `Payment awaiting verification — ${order.orderNumber}`,
          href: "/admin/orders",
        })
      }
      if (order.status === "payment_confirmed") {
        items.push({
          id: `order-prepare-${order.id}`,
          category: "action_required",
          title: `Order ready for preparation — ${order.orderNumber}`,
          href: "/admin/orders",
        })
      }
    }

    for (const bottle of lowVolumeBottles) {
      const fragrance = fragrances.data?.find(
        (item) => item.id === bottle.fragranceId
      )
      items.push({
        id: `bottle-low-${bottle.id}`,
        category: "needs_review",
        title: `${fragrance?.name ?? "Bottle"} running low (${bottle.remainingVolumeMl}ml left)`,
        href: `/admin/bottles/${bottle.id}`,
      })
    }

    return items
  }, [orders.data, lowVolumeBottles, fragrances.data])

  const recentOrders = useMemo(
    () =>
      [...(orders.data ?? [])]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [orders.data]
  )

  const recentActivity = useMemo(
    () =>
      [...(orders.data ?? [])]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 6),
    [orders.data]
  )

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper>
        <div className="grid gap-5">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-4">
            <MetricCard
              label="Orders today"
              value={String(metrics.ordersTodayCount)}
              detail="Orders placed since midnight"
              icon={Invoice03Icon}
              tone="info"
            />
            <MetricCard
              label="Revenue this month"
              value={money(metrics.revenueThisMonth)}
              detail="Paid orders this month"
              icon={Activity01Icon}
              tone="success"
            />
            <MetricCard
              label="Average order value"
              value={money(metrics.averageOrderValue)}
              detail="Across paid orders"
              icon={Invoice03Icon}
            />
            <MetricCard
              label="Pending payments"
              value={String(metrics.pendingPaymentsCount)}
              detail="Awaiting verification"
              icon={AlertCircleIcon}
              tone="warning"
            />
            <MetricCard
              label="Fragrances"
              value={String(fragrances.data?.length ?? 0)}
              detail={`${draftCount} draft records`}
              icon={PerfumeIcon}
            />
            <MetricCard
              label="Available bottles"
              value={String(availableBottleCount)}
              detail="Ready for allocation"
              icon={MilkBottleIcon}
              tone="success"
            />
            <MetricCard
              label="Suppliers"
              value={String(suppliers.data?.length ?? 0)}
              detail="Trusted sources on file"
              icon={UserGroup02Icon}
            />
          </div>

          <SectionWrapper
            title="Actionable inbox"
            description="Payments to verify, orders to prepare, and inventory alerts, in one place."
          >
            {inboxItems.length ? (
              <div className="grid gap-2">
                {inboxItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                  >
                    <span className="text-foreground">{item.title}</span>
                    <StatusBadge
                      status={item.category}
                      config={inboxCategoryConfig}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Inbox is empty"
                description="Nothing urgent right now — payments verified, orders prepared, and inventory levels healthy."
                icon={InboxIcon}
                surface="plain"
              />
            )}
          </SectionWrapper>

          <div className="grid items-start gap-5 lg:grid-cols-2">
            <SectionWrapper
              title="Sales chart"
              description="Revenue over the last 14 days."
            >
              <div className="h-64">
                <Bar
                  data={{
                    labels: salesByDay.map((day) => day.label),
                    datasets: [
                      {
                        label: "Revenue (MVR)",
                        data: salesByDay.map((day) => day.revenue),
                        backgroundColor: "oklch(0.31 0.055 166)",
                        borderRadius: 4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              </div>
            </SectionWrapper>
            <SectionWrapper
              title="Recent orders"
              description="Latest orders across every status."
            >
              {recentOrders.length ? (
                <div className="overflow-hidden rounded-xl bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-4">Order</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="px-4 font-semibold text-foreground">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              status={order.status}
                              config={orderStatusConfig}
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
              ) : (
                <EmptyState
                  title="No orders yet"
                  description="Recent orders will appear here once checkout is implemented."
                  icon={Invoice03Icon}
                  surface="plain"
                />
              )}
            </SectionWrapper>
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-2">
            <SectionWrapper
              title="Packaging inventory health"
              description="Stock levels for atomizers, boxes, and labels."
            >
              {lowStockPackaging.length ? (
                <div className="grid gap-2">
                  {lowStockPackaging.map((item) => (
                    <Link
                      key={item.id}
                      href="/admin/packaging"
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                    >
                      <span className="text-foreground">{item.name}</span>
                      <span className="text-muted-foreground">
                        {item.quantity} / {item.minimumQuantity} {item.unit}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Packaging levels healthy"
                  description="No packaging items are at or below their minimum quantity."
                  icon={Package02Icon}
                  surface="plain"
                />
              )}
            </SectionWrapper>
            <SectionWrapper
              title="Recent activity"
              description="Latest order status changes."
            >
              {recentActivity.length ? (
                <div className="grid gap-2">
                  {recentActivity.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm"
                    >
                      <span className="text-foreground">
                        {order.orderNumber} ·{" "}
                        {orderStatusConfig[order.status]?.label ?? order.status}
                      </span>
                      <span className="text-muted-foreground">
                        {formatDateTime(order.updatedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No activity yet"
                  description="Activity will appear here once orders start moving through the pipeline."
                  icon={Activity01Icon}
                  surface="plain"
                />
              )}
            </SectionWrapper>
          </div>
        </div>
      </PageWrapper>
    </AdminShell>
  )
}
