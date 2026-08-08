"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckmarkCircle02Icon,
  PerfumeIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { EmptyState } from "@/components/common/empty-state"
import { LoadingState } from "@/components/common/loading-state"
import { SearchInput } from "@/components/common/search-input"
import {
  StatusBadge,
  type StatusBadgeConfig,
} from "@/components/common/status-badge"
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
import { useFragrances } from "@/features/catalog/hooks/use-catalog"

export const fragranceStatusConfig: StatusBadgeConfig = {
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
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const fragrances = useFragrances()

  const visibleFragrances = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return (fragrances.data ?? []).filter((fragrance) => {
      const matchesStatus =
        statusFilter === "all" || fragrance.status === statusFilter
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

  const addFragranceAction = (
    <Link className={buttonVariants()} href="/admin/fragrances/new">
      <HugeiconsIcon
        aria-hidden="true"
        data-icon="inline-start"
        icon={PlusSignIcon}
        strokeWidth={1.5}
      />
      Add fragrance
    </Link>
  )

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Fragrances" },
        ]}
        title="Fragrances"
        actions={addFragranceAction}
      >
        <div className="grid grid-cols-1 gap-5">
          <Toolbar>
            <SearchInput
              className="min-w-0"
              placeholder="Search by brand, fragrance, perfumer, or gender"
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

          {fragrances.isLoading ? (
            <LoadingState label="Loading fragrances..." />
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
                    {visibleFragrances.map((fragrance) => (
                      <TableRow
                        key={fragrance.id}
                        className="cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onClick={() => router.push(`/admin/fragrances/${fragrance.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            router.push(`/admin/fragrances/${fragrance.id}`)
                          }
                        }}
                      >
                        <TableCell className="px-4 font-semibold text-foreground">
                          {fragrance.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {fragrance.brand.name}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={fragrance.status}
                            config={fragranceStatusConfig}
                          />
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {fragrance.images.length}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {fragrance.offerings.length}
                        </TableCell>
                      </TableRow>
                    ))}
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
        </div>
      </PageWrapper>
    </AdminShell>
  )
}
