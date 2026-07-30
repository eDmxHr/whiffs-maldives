"use client"

import { Invoice03Icon } from "@hugeicons/core-free-icons"

import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { AdminShell } from "@/components/layouts/admin-shell"
import { Inspector, PageWrapper, Toolbar } from "@/components/layouts/page"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type OrdersScreenProps = {
  user: { name: string; role: string }
}

export function OrdersScreen({ user }: OrdersScreenProps) {
  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Orders" }]} title="Orders">
        <div className="grid gap-5">
          <Toolbar>
            <SearchInput className="min-w-0" placeholder="Search by order number, customer, phone, fragrance, or brand" disabled />
            <Select disabled>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
              </SelectContent>
            </Select>
          </Toolbar>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <EmptyState
              title="No orders yet"
              description="Orders will appear here once checkout and payment workflows are implemented."
              icon={Invoice03Icon}
            />

            <Inspector>
              <div className="border-b border-border/70 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-admin-champagne">Inspector</p>
                <h2 className="mt-1 text-lg font-semibold">Order detail</h2>
              </div>
              <div className="p-5">
                <EmptyState title="No order selected" description="Select an order from the list to review payment and fulfillment details." icon={Invoice03Icon} />
              </div>
            </Inspector>
          </div>
        </div>
      </PageWrapper>
    </AdminShell>
  )
}
