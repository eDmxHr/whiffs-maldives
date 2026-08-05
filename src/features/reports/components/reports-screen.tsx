"use client"

import { useMemo } from "react"
import { Analytics01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
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
import { LoadingState } from "@/components/common/loading-state"
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
import { useBottles, useFragrances } from "@/features/catalog/hooks/use-catalog"
import { useOrders } from "@/features/orders/hooks/use-orders"
import { money } from "@/lib/money"
import { bestSellers, bottleProfitability, salesByDay } from "@/lib/reports"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

type ReportsScreenProps = {
  user: { name: string; role: string }
}

export function ReportsScreen({ user }: ReportsScreenProps) {
  const orders = useOrders()
  const bottles = useBottles()
  const fragrances = useFragrances()

  const isLoading = orders.isLoading || bottles.isLoading || fragrances.isLoading

  const sales = useMemo(() => salesByDay(orders.data ?? [], 30), [orders.data])
  const topSellers = useMemo(
    () => bestSellers(orders.data ?? []).sort((a, b) => b.revenue - a.revenue).slice(0, 8),
    [orders.data]
  )
  const profitability = useMemo(
    () =>
      bottleProfitability(bottles.data ?? [], fragrances.data ?? [])
        .sort((a, b) => b.estimatedRemainingProfit - a.estimatedRemainingProfit),
    [bottles.data, fragrances.data]
  )

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Reports" }]}
        title="Reports"
        description="Sales, best sellers, and bottle profitability, computed from current orders and inventory."
      >
        {isLoading ? (
          <LoadingState label="Loading reports..." />
        ) : (
          <div className="grid gap-5">
            <SectionWrapper
              title="Sales over time"
              description="Revenue from paid orders over the last 30 days."
              icon={<HugeiconsIcon aria-hidden="true" className="size-5 text-admin-reef" icon={Analytics01Icon} strokeWidth={1.5} />}
            >
              <div className="h-72">
                <Bar
                  data={{
                    labels: sales.map((day) => day.label),
                    datasets: [
                      {
                        label: "Revenue (MVR)",
                        data: sales.map((day) => day.revenue),
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

            <SectionWrapper title="Best sellers" description="Ranked by revenue from paid orders.">
              {topSellers.length ? (
                <div className="overflow-hidden rounded-xl bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-4">Offering</TableHead>
                        <TableHead className="text-right">Quantity sold</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topSellers.map((row) => (
                        <TableRow key={row.name}>
                          <TableCell className="px-4 font-semibold text-foreground">{row.name}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{row.quantity}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{money(row.revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState
                  title="No sales yet"
                  description="Best sellers will appear here once orders are paid."
                  icon={Analytics01Icon}
                  surface="plain"
                />
              )}
            </SectionWrapper>

            <SectionWrapper
              title="Bottle profitability"
              description="Estimated gross margin per ml, using each bottle's cost basis against its fragrance's active offering prices."
            >
              {profitability.length ? (
                <div className="overflow-hidden rounded-xl bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-4">Fragrance</TableHead>
                        <TableHead className="text-right">Cost / ml</TableHead>
                        <TableHead className="text-right">Revenue / ml</TableHead>
                        <TableHead className="text-right">Margin / ml</TableHead>
                        <TableHead className="text-right">Remaining</TableHead>
                        <TableHead className="text-right">Est. remaining profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profitability.map((row) => (
                        <TableRow key={row.bottleId}>
                          <TableCell className="px-4 font-semibold text-foreground">{row.fragranceName}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{money(row.costPerMl)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{money(row.avgRevenuePerMl)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{money(row.grossMarginPerMl)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{row.remainingVolumeMl}ml</TableCell>
                          <TableCell className="text-right text-muted-foreground">{money(row.estimatedRemainingProfit)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState
                  title="No bottles yet"
                  description="Add bottle inventory to see profitability estimates."
                  icon={Analytics01Icon}
                  surface="plain"
                />
              )}
            </SectionWrapper>
          </div>
        )}
      </PageWrapper>
    </AdminShell>
  )
}
