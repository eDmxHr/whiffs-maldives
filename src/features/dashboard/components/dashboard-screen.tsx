"use client"

import {
  Activity01Icon,
  InboxIcon,
  Invoice03Icon,
  MilkBottleIcon,
  Package02Icon,
  PerfumeIcon,
  UserGroup02Icon,
} from "@hugeicons/core-free-icons"

import { EmptyState } from "@/components/common/empty-state"
import { MetricCard } from "@/components/common/metric-card"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper, SectionWrapper } from "@/components/layouts/page"
import { useBottles, useFragrances, useSuppliers } from "@/features/catalog/hooks/use-catalog"

type DashboardScreenProps = {
  user: { name: string; role: string }
}

export function DashboardScreen({ user }: DashboardScreenProps) {
  const fragrances = useFragrances()
  const bottles = useBottles()
  const suppliers = useSuppliers()

  const draftCount = fragrances.data?.filter((fragrance) => fragrance.status === "draft").length ?? 0
  const availableBottleCount = bottles.data?.filter((bottle) => bottle.status === "available").length ?? 0

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper>
        <div className="grid gap-5">
          <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))]">
            <MetricCard label="Fragrances" value={String(fragrances.data?.length ?? 0)} detail={`${draftCount} draft records`} icon={PerfumeIcon} />
            <MetricCard label="Available bottles" value={String(availableBottleCount)} detail="Ready for allocation" icon={MilkBottleIcon} tone="success" />
            <MetricCard label="Orders today" value="—" detail="Requires order data" icon={Invoice03Icon} tone="info" />
            <MetricCard label="Suppliers" value={String(suppliers.data?.length ?? 0)} detail="Trusted sources on file" icon={UserGroup02Icon} />
          </div>

          <SectionWrapper title="Actionable inbox" description="Payments to verify, orders to prepare, and inventory alerts, in one place.">
            <EmptyState
              title="Inbox is empty"
              description="The inbox will surface urgent, action-required, and reminder items once orders and payments exist."
              icon={InboxIcon}
              surface="plain"
            />
          </SectionWrapper>

          <div className="grid items-start gap-5 lg:grid-cols-2">
            <SectionWrapper title="Sales chart" description="Revenue and order volume over time.">
              <EmptyState title="No sales data yet" description="Chart populates once orders start flowing through checkout." icon={Activity01Icon} surface="plain" />
            </SectionWrapper>
            <SectionWrapper title="Recent orders" description="Latest orders across every status.">
              <EmptyState title="No orders yet" description="Recent orders will appear here once checkout is implemented." icon={Invoice03Icon} surface="plain" />
            </SectionWrapper>
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-2">
            <SectionWrapper title="Packaging inventory health" description="Stock levels for atomizers, boxes, and labels.">
              <EmptyState title="Not tracked yet" description="Packaging inventory needs the packaging items domain to be built." icon={Package02Icon} surface="plain" />
            </SectionWrapper>
            <SectionWrapper title="Recent activity" description="Audit trail of admin actions.">
              <EmptyState title="No activity yet" description="Activity logging will appear here once the audit log table is wired up." icon={Activity01Icon} surface="plain" />
            </SectionWrapper>
          </div>
        </div>
      </PageWrapper>
    </AdminShell>
  )
}
