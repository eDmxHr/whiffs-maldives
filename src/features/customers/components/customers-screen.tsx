"use client"

import { UserGroup02Icon } from "@hugeicons/core-free-icons"

import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { AdminShell } from "@/components/layouts/admin-shell"
import { Inspector, PageWrapper, Toolbar } from "@/components/layouts/page"

type CustomersScreenProps = {
  user: { name: string; role: string }
}

export function CustomersScreen({ user }: CustomersScreenProps) {
  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Customers" }]} title="Customers">
        <div className="grid gap-5">
          <Toolbar>
            <SearchInput placeholder="Search by name, phone, or email" disabled />
          </Toolbar>

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <EmptyState
              title="No customers yet"
              description="Customer records will appear here once checkout captures customer details."
              icon={UserGroup02Icon}
            />

            <Inspector>
              <div className="px-3 pb-3 pt-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-admin-champagne">Inspector</p>
                <h2 className="mt-1 text-lg font-semibold">Customer detail</h2>
              </div>
              <div className="flex flex-1 flex-col rounded-xl bg-background p-4 md:p-5">
                <EmptyState title="No customer selected" description="Select a customer from the list to review order history and preferences." icon={UserGroup02Icon} surface="plain" />
              </div>
            </Inspector>
          </div>
        </div>
      </PageWrapper>
    </AdminShell>
  )
}
