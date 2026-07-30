"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { CheckmarkCircle02Icon, PerfumeIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { StatusBadge, type StatusBadgeConfig } from "@/components/common/status-badge"
import { AdminShell } from "@/components/layouts/admin-shell"
import { Inspector, PageWrapper, Toolbar } from "@/components/layouts/page"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useFragrances } from "@/features/catalog/hooks/use-catalog"

const fragranceStatusConfig: StatusBadgeConfig = {
  draft: {
    label: "Draft",
    variant: "warning",
    icon: PerfumeIcon,
    description: "Visible to admins while catalog content is prepared.",
  },
  published: {
    label: "Published",
    variant: "success",
    icon: CheckmarkCircle02Icon,
    description: "Visible on the customer site.",
  },
  archived: {
    label: "Archived",
    variant: "neutral",
    icon: PerfumeIcon,
    description: "Hidden from active selling workflows.",
  },
}

type FragranceScreenProps = {
  user: { name: string; role: string }
}

type StatusFilter = "all" | "draft" | "published" | "archived"

const statusFilterItems: Array<{ label: string; value: StatusFilter }> = [
  { label: "All statuses", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
]

export function FragranceScreen({ user }: FragranceScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedFragranceId, setSelectedFragranceId] = useState("")
  const fragrances = useFragrances()

  const visibleFragrances = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return (fragrances.data ?? []).filter((fragrance) => {
      const matchesStatus = statusFilter === "all" || fragrance.status === statusFilter
      const searchableText = [
        fragrance.brand.name,
        fragrance.name,
        fragrance.concentration,
        fragrance.perfumer,
        fragrance.gender,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return matchesStatus && (!query || searchableText.includes(query))
    })
  }, [fragrances.data, searchQuery, statusFilter])

  const selectedFragrance = useMemo(() => {
    return (fragrances.data ?? []).find((fragrance) => fragrance.id === selectedFragranceId) ?? visibleFragrances[0]
  }, [fragrances.data, selectedFragranceId, visibleFragrances])

  const addFragranceAction = (
    <Link className={buttonVariants()} href="/admin/fragrances/new">
      <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={PlusSignIcon} strokeWidth={1.5} />
      Add fragrance
    </Link>
  )

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Fragrances" }]}
        title="Fragrances"
        actions={addFragranceAction}
      >
        <div className="grid gap-5">
          <Toolbar>
            <SearchInput
              className="min-w-0"
              placeholder="Search by brand, fragrance, perfumer, or gender"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <Select items={statusFilterItems} value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
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

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            {fragrances.isLoading ? (
              <div className="flex flex-col rounded-2xl bg-card p-2 text-sm text-muted-foreground">
                <div className="flex flex-1 rounded-xl bg-background p-5">Loading fragrances...</div>
              </div>
            ) : visibleFragrances.length ? (
              <div className="flex flex-col rounded-2xl bg-card p-2">
                <div className="flex-1 overflow-hidden rounded-xl bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-4">Fragrance</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Images</TableHead>
                        <TableHead className="text-right">Offerings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleFragrances.map((fragrance) => {
                        const selected = selectedFragrance?.id === fragrance.id

                        return (
                          <TableRow
                            key={fragrance.id}
                            data-state={selected ? "selected" : undefined}
                            className="cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedFragranceId(fragrance.id)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault()
                                setSelectedFragranceId(fragrance.id)
                              }
                            }}
                          >
                            <TableCell className="px-4 font-semibold text-foreground">{fragrance.name}</TableCell>
                            <TableCell className="text-muted-foreground">{fragrance.brand.name}</TableCell>
                            <TableCell>
                              <StatusBadge status={fragrance.status} config={fragranceStatusConfig} />
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">{fragrance.images.length}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{fragrance.offerings.length}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No fragrances found"
                description="Add a fragrance or adjust the filters to review catalog records."
                icon={PerfumeIcon}
                action={addFragranceAction}
              />
            )}

            <Inspector>
              <div className="px-3 pb-3 pt-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-admin-champagne">Inspector</p>
                <h2 className="mt-1 text-lg font-semibold">Fragrance detail</h2>
              </div>
              <div className="flex flex-1 flex-col rounded-xl bg-background p-4 md:p-5">
                {selectedFragrance ? (
                  <div className="grid gap-4 text-sm">
                    <div className="rounded-xl bg-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground">{selectedFragrance.name}</div>
                          <div className="text-muted-foreground">{selectedFragrance.brand.name}</div>
                        </div>
                        <StatusBadge status={selectedFragrance.status} config={fragranceStatusConfig} />
                      </div>
                    </div>
                    <p className="leading-6 text-muted-foreground">{selectedFragrance.description}</p>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <div className="rounded-xl bg-card p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Images</p>
                        <p className="mt-2 text-xl font-semibold">{selectedFragrance.images.length}</p>
                      </div>
                      <div className="rounded-xl bg-card p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Offerings</p>
                        <p className="mt-2 text-xl font-semibold">{selectedFragrance.offerings.length}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState title="No fragrance selected" description="Select a fragrance from the list to review the catalog summary." icon={PerfumeIcon} surface="plain" />
                )}
              </div>
            </Inspector>
          </div>
        </div>
      </PageWrapper>
    </AdminShell>
  )
}
