"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MilkBottleIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { StatusBadge, type StatusBadgeConfig } from "@/components/common/status-badge"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper, Toolbar } from "@/components/layouts/page"
import { buttonVariants } from "@/components/ui/button"
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
import { useBottles, useFragrances, useSuppliers } from "@/features/catalog/hooks/use-catalog"
import { money } from "@/lib/money"

export const bottleStatusConfig: StatusBadgeConfig = {
  available: {
    label: "Available",
    variant: "success",
    icon: MilkBottleIcon,
    description: "Available for fulfillment allocation.",
  },
  low_volume: {
    label: "Low volume",
    variant: "warning",
    icon: MilkBottleIcon,
    description: "Needs attention before future allocations.",
  },
  empty: {
    label: "Empty",
    variant: "neutral",
    icon: MilkBottleIcon,
    description: "No usable volume remains.",
  },
  archived: {
    label: "Archived",
    variant: "neutral",
    icon: MilkBottleIcon,
    description: "Removed from active inventory views.",
  },
}

type BottleListScreenProps = {
  user: { name: string; role: string }
}

type StatusFilter = "all" | "available" | "low_volume" | "empty" | "archived"

const statusFilterItems: Array<{ label: string; value: StatusFilter }> = [
  { label: "All statuses", value: "all" },
  { label: "Available", value: "available" },
  { label: "Low volume", value: "low_volume" },
  { label: "Empty", value: "empty" },
  { label: "Archived", value: "archived" },
]

export function BottleListScreen({ user }: BottleListScreenProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const bottles = useBottles()
  const fragrances = useFragrances()
  const suppliers = useSuppliers()

  const visibleBottles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return (bottles.data ?? []).filter((bottle) => {
      const fragrance = fragrances.data?.find((item) => item.id === bottle.fragranceId)
      const supplier = suppliers.data?.find((item) => item.id === bottle.supplierId)
      const matchesStatus = statusFilter === "all" || bottle.status === statusFilter
      const searchableText = [fragrance?.name, fragrance?.brand.name, supplier?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return matchesStatus && (!query || searchableText.includes(query))
    })
  }, [bottles.data, fragrances.data, suppliers.data, searchQuery, statusFilter])

  const addBottleAction = (
    <Link className={buttonVariants()} href="/admin/bottles/new">
      <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={PlusSignIcon} strokeWidth={1.5} />
      Add bottle
    </Link>
  )

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Bottles" }]}
        title="Bottles"
        actions={addBottleAction}
      >
        <div className="grid gap-5">
          <Toolbar>
            <SearchInput
              className="min-w-0"
              placeholder="Search by fragrance, brand, or supplier"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <Select
              items={statusFilterItems}
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger className="md:w-48">
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

          {bottles.isLoading ? (
            <div className="flex flex-col rounded-2xl bg-card p-2 text-sm text-muted-foreground">
              <div className="flex flex-1 rounded-xl bg-background p-5">Loading bottles...</div>
            </div>
          ) : visibleBottles.length ? (
            <div className="flex flex-col rounded-2xl bg-card p-2">
              <div className="flex-1 overflow-hidden rounded-xl bg-background">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4">Fragrance</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Remaining / usable ml</TableHead>
                      <TableHead className="text-right">Purchase price</TableHead>
                      <TableHead className="text-right">Purchase date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleBottles.map((bottle) => {
                      const fragrance = fragrances.data?.find((item) => item.id === bottle.fragranceId)
                      const supplier = suppliers.data?.find((item) => item.id === bottle.supplierId)

                      return (
                        <TableRow
                          key={bottle.id}
                          className="cursor-pointer"
                          role="button"
                          tabIndex={0}
                          onClick={() => router.push(`/admin/bottles/${bottle.id}`)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault()
                              router.push(`/admin/bottles/${bottle.id}`)
                            }
                          }}
                        >
                          <TableCell className="px-4 font-semibold text-foreground">
                            {fragrance?.name ?? "Unknown fragrance"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {supplier?.name ?? "Unknown supplier"}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={bottle.status} config={bottleStatusConfig} />
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {bottle.remainingVolumeMl}/{bottle.usableVolumeMl} ml
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {money(bottle.purchasePrice)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {bottle.purchaseDate}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No bottles found"
              description="Add a bottle or adjust the filters to review inventory records."
              icon={MilkBottleIcon}
              action={addBottleAction}
            />
          )}
        </div>
      </PageWrapper>
    </AdminShell>
  )
}
