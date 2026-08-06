"use client"

import { useMemo, useState } from "react"
import { UserGroup02Icon } from "@hugeicons/core-free-icons"

import { DetailField, DetailGrid } from "@/components/common/detail-field"
import { EmptyState } from "@/components/common/empty-state"
import { FieldLabel } from "@/components/common/field-label"
import { LoadingState } from "@/components/common/loading-state"
import { SearchInput } from "@/components/common/search-input"
import { StatusBadge } from "@/components/common/status-badge"
import { AdminShell } from "@/components/layouts/admin-shell"
import { Heading, Inspector, PageWrapper, Toolbar } from "@/components/layouts/page"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { orderStatusConfig } from "@/features/orders/components/orders-screen"
import { useCustomer, useCustomers } from "@/features/customers/hooks/use-customers"
import { money } from "@/lib/money"

type CustomersScreenProps = {
  user: { name: string; role: string }
}

export function CustomersScreen({ user }: CustomersScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const customers = useCustomers()
  const customerDetail = useCustomer(selectedCustomerId ?? "")

  const visibleCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return (customers.data ?? []).filter((customer) => {
      const searchableText = [customer.name, customer.phone, customer.email].filter(Boolean).join(" ").toLowerCase()
      return !query || searchableText.includes(query)
    })
  }, [customers.data, searchQuery])

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Customers" }]} title="Customers">
        <div className="grid gap-5">
          <Toolbar>
            <SearchInput
              placeholder="Search by name, phone, or email"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </Toolbar>

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            {customers.isLoading ? (
              <LoadingState label="Loading customers..." />
            ) : visibleCustomers.length ? (
              <div className="flex flex-col rounded-2xl bg-card p-2">
                <div className="flex-1 overflow-hidden rounded-xl bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-4">Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Lifetime value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleCustomers.map((customer) => (
                        <TableRow
                          key={customer.id}
                          className="cursor-pointer"
                          role="button"
                          tabIndex={0}
                          data-state={customer.id === selectedCustomerId ? "selected" : undefined}
                          onClick={() => setSelectedCustomerId(customer.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault()
                              setSelectedCustomerId(customer.id)
                            }
                          }}
                        >
                          <TableCell className="px-4 font-semibold text-foreground">{customer.name}</TableCell>
                          <TableCell className="text-muted-foreground">{customer.phone || customer.email}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{customer.orderCount}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{money(customer.lifetimeValue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No customers found"
                description="Adjust the search to find a customer record."
                icon={UserGroup02Icon}
              />
            )}

            <Inspector>
              <div className="px-3 pb-3 pt-2">
                <Heading size="section" eyebrow="Inspector" title="Customer detail" />
              </div>
              <div className="flex flex-1 flex-col rounded-xl bg-background p-4 md:p-5">
                {customerDetail.data ? (
                  <div className="divide-y divide-border text-sm">
                    <div className="pb-4">
                      <div className="font-semibold text-foreground">{customerDetail.data.name}</div>
                      <div className="text-muted-foreground">{customerDetail.data.phone}</div>
                      <div className="text-muted-foreground">{customerDetail.data.email}</div>
                    </div>

                    <div className="py-4">
                      <FieldLabel>Value</FieldLabel>
                      <DetailGrid cols={2}>
                        <DetailField label="Orders" value={customerDetail.data.orderCount} />
                        <DetailField label="Lifetime value" value={money(customerDetail.data.lifetimeValue)} />
                      </DetailGrid>
                    </div>

                    <div className="py-4">
                      <FieldLabel>Order history</FieldLabel>
                      <div className="mt-3 grid gap-2">
                        {customerDetail.data.orders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between gap-3">
                            <span className="text-foreground">{order.orderNumber}</span>
                            <StatusBadge status={order.status} config={orderStatusConfig} />
                            <span className="text-muted-foreground">{money(order.total)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {customerDetail.data.notes ? (
                      <div className="pt-4">
                        <FieldLabel>Notes</FieldLabel>
                        <p className="mt-2 leading-6 text-muted-foreground">{customerDetail.data.notes}</p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <EmptyState
                    title="No customer selected"
                    description="Select a customer from the list to review order history and preferences."
                    icon={UserGroup02Icon}
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
