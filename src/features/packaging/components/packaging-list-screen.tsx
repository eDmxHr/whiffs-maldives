"use client"

import { useMemo, useState } from "react"
import { MoreHorizontalIcon, Package02Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { EmptyState } from "@/components/common/empty-state"
import { LoadingState } from "@/components/common/loading-state"
import { SearchInput } from "@/components/common/search-input"
import { StatusBadge, type StatusBadgeConfig } from "@/components/common/status-badge"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper, SectionWrapper, Toolbar } from "@/components/layouts/page"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { usePackagingItems, usePackagingMutations } from "@/features/packaging/hooks/use-packaging"
import { DEFAULT_DECANT_SIZES } from "@/lib/pricing"
import type { PackagingItem } from "@/types/packaging"

const SHARED_SIZE_VALUE = "shared"

const decantSizeOptions = [
  { label: "All sizes", value: SHARED_SIZE_VALUE },
  ...DEFAULT_DECANT_SIZES.map((size) => ({ label: `${size}ml`, value: String(size) })),
]

const stockStatusConfig: StatusBadgeConfig = {
  low: { label: "Low stock", variant: "warning" },
  ok: { label: "In stock", variant: "success" },
  archived: { label: "Archived", variant: "neutral" },
}

type PackagingListScreenProps = {
  user: { name: string; role: string }
}

type NewItemForm = {
  name: string
  unit: string
  unitCost: string
  quantity: string
  minimumQuantity: string
  decantSizeMl: string
}

type RowEdit = { name: string; unit: string; quantity: string; unitCost: string; minimumQuantity: string; decantSizeMl: string }

export function PackagingListScreen({ user }: PackagingListScreenProps) {
  const items = usePackagingItems()
  const mutations = usePackagingMutations()
  const [searchQuery, setSearchQuery] = useState("")
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [rowEdits, setRowEdits] = useState<Record<string, RowEdit>>({})
  const [error, setError] = useState("")
  const [newItem, setNewItem] = useState<NewItemForm>({
    name: "",
    unit: "",
    unitCost: "",
    quantity: "",
    minimumQuantity: "",
    decantSizeMl: SHARED_SIZE_VALUE,
  })

  const visibleItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return (items.data ?? []).filter((item) => {
      const isLow = item.isActive && item.quantity <= item.minimumQuantity
      const matchesStock = !lowStockOnly || isLow
      return matchesStock && (!query || item.name.toLowerCase().includes(query))
    })
  }, [items.data, searchQuery, lowStockOnly])

  type EditableField = "name" | "unit" | "quantity" | "unitCost" | "minimumQuantity" | "decantSizeMl"

  function defaultEditFor(item: PackagingItem): RowEdit {
    return {
      name: item.name,
      unit: item.unit,
      quantity: String(item.quantity),
      unitCost: String(item.unitCost),
      minimumQuantity: String(item.minimumQuantity),
      decantSizeMl: item.decantSizeMl === null ? SHARED_SIZE_VALUE : String(item.decantSizeMl),
    }
  }

  function editValue(item: PackagingItem, field: EditableField) {
    return rowEdits[item.id]?.[field] ?? defaultEditFor(item)[field]
  }

  function setEditValue(item: PackagingItem, field: EditableField, value: string) {
    setRowEdits((current) => ({
      ...current,
      [item.id]: {
        ...(current[item.id] ?? defaultEditFor(item)),
        [field]: value,
      },
    }))
  }

  async function saveRow(item: PackagingItem) {
    setError("")
    const edit = rowEdits[item.id]

    if (!edit) {
      return
    }

    if (!edit.name.trim() || !edit.unit.trim()) {
      setError("Name and unit cannot be empty.")
      return
    }

    try {
      await mutations.updatePackagingItem.mutateAsync({
        id: item.id,
        input: {
          name: edit.name.trim(),
          unit: edit.unit.trim(),
          quantity: Number(edit.quantity),
          unitCost: Number(edit.unitCost),
          minimumQuantity: Number(edit.minimumQuantity),
          decantSizeMl: edit.decantSizeMl === SHARED_SIZE_VALUE ? null : Number(edit.decantSizeMl),
        },
      })
      setRowEdits((current) => {
        const next = { ...current }
        delete next[item.id]
        return next
      })
      toast.add({ title: `${item.name} updated.`, type: "success" })
    } catch {
      setError(`Could not update ${item.name}.`)
    }
  }

  async function archiveItem(item: PackagingItem) {
    setError("")

    try {
      await mutations.archivePackagingItem.mutateAsync(item.id)
      toast.add({ title: `${item.name} archived.`, type: "success" })
    } catch {
      setError(`Could not archive ${item.name}.`)
    }
  }

  async function restoreItem(item: PackagingItem) {
    setError("")

    try {
      await mutations.restorePackagingItem.mutateAsync(item.id)
      toast.add({ title: `${item.name} restored.`, type: "success" })
    } catch {
      setError(`Could not restore ${item.name}.`)
    }
  }

  async function addItem() {
    setError("")

    if (!newItem.name.trim() || !newItem.unit.trim()) {
      setError("Enter a name and unit for the new item.")
      return
    }

    try {
      await mutations.createPackagingItem.mutateAsync({
        name: newItem.name,
        unit: newItem.unit,
        unitCost: Number(newItem.unitCost) || 0,
        quantity: Number(newItem.quantity) || 0,
        minimumQuantity: Number(newItem.minimumQuantity) || 0,
        decantSizeMl: newItem.decantSizeMl === SHARED_SIZE_VALUE ? null : Number(newItem.decantSizeMl),
      })
      setNewItem({ name: "", unit: "", unitCost: "", quantity: "", minimumQuantity: "", decantSizeMl: SHARED_SIZE_VALUE })
      toast.add({ title: "Packaging item added.", type: "success" })
    } catch {
      setError("Could not add packaging item.")
    }
  }

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Packaging" }]} title="Packaging">
        <div className="grid grid-cols-1 gap-5">
          <Toolbar>
            <SearchInput
              className="min-w-0"
              placeholder="Search packaging items"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <Button
              type="button"
              variant={lowStockOnly ? "secondary" : "outline"}
              onClick={() => setLowStockOnly((current) => !current)}
            >
              Low stock only
            </Button>
          </Toolbar>

          {error ? (
            <div className="rounded-xl bg-admin-danger/12 px-4 py-3 text-sm font-medium text-admin-danger">{error}</div>
          ) : null}

          <SectionWrapper
            headerEyebrow="Operations"
            title="Packaging inventory"
            icon={Package02Icon}
          >
            {items.isLoading ? (
              <LoadingState label="Loading packaging items..." surface="plain" />
            ) : visibleItems.length ? (
              <div className="overflow-hidden rounded-xl bg-background">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4">Item</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Unit cost</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Minimum</TableHead>
                      <TableHead>Applies to</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleItems.map((item) => {
                      const isLow = item.quantity <= item.minimumQuantity
                      const dirty = Boolean(rowEdits[item.id])
                      const status = !item.isActive ? "archived" : isLow ? "low" : "ok"

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="px-4">
                            <Input
                              className="h-9 w-36 font-semibold text-foreground"
                              disabled={!item.isActive}
                              value={editValue(item, "name")}
                              onChange={(event) => setEditValue(item, "name", event.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              className="h-9 w-24"
                              disabled={!item.isActive}
                              value={editValue(item, "unit")}
                              onChange={(event) => setEditValue(item, "unit", event.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              className="h-9 w-24"
                              type="number"
                              min={0}
                              disabled={!item.isActive}
                              value={editValue(item, "unitCost")}
                              onChange={(event) => setEditValue(item, "unitCost", event.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              className="h-9 w-24"
                              type="number"
                              min={0}
                              disabled={!item.isActive}
                              value={editValue(item, "quantity")}
                              onChange={(event) => setEditValue(item, "quantity", event.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              className="h-9 w-24"
                              type="number"
                              min={0}
                              disabled={!item.isActive}
                              value={editValue(item, "minimumQuantity")}
                              onChange={(event) => setEditValue(item, "minimumQuantity", event.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              disabled={!item.isActive}
                              items={decantSizeOptions}
                              value={editValue(item, "decantSizeMl")}
                              onValueChange={(value) => setEditValue(item, "decantSizeMl", (value as string) ?? SHARED_SIZE_VALUE)}
                            >
                              <SelectTrigger className="data-[size=sm]:h-9 w-32" size="sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {decantSizeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={status} config={stockStatusConfig} />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                                aria-label={`Actions for ${item.name}`}
                              >
                                <HugeiconsIcon aria-hidden="true" icon={MoreHorizontalIcon} strokeWidth={1.5} />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {item.isActive ? (
                                  <>
                                    <DropdownMenuItem
                                      disabled={!dirty || mutations.updatePackagingItem.isPending}
                                      onClick={() => saveRow(item)}
                                    >
                                      Save changes
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      variant="destructive"
                                      disabled={mutations.archivePackagingItem.isPending}
                                      onClick={() => archiveItem(item)}
                                    >
                                      Archive
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  <DropdownMenuItem
                                    disabled={mutations.restorePackagingItem.isPending}
                                    onClick={() => restoreItem(item)}
                                  >
                                    Restore
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState
                title="No packaging items found"
                description="Adjust the search or add a new packaging item below."
                icon={Package02Icon}
                surface="plain"
              />
            )}

            <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-background p-4">
              <Label className="w-40">
                Name
                <Input
                  value={newItem.name}
                  onChange={(event) => setNewItem((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Shipping box"
                />
              </Label>
              <Label className="w-28">
                Unit
                <Input
                  value={newItem.unit}
                  onChange={(event) => setNewItem((current) => ({ ...current, unit: event.target.value }))}
                  placeholder="piece"
                />
              </Label>
              <Label className="w-24">
                Cost
                <Input
                  type="number"
                  min={0}
                  value={newItem.unitCost}
                  onChange={(event) => setNewItem((current) => ({ ...current, unitCost: event.target.value }))}
                />
              </Label>
              <Label className="w-24">
                Quantity
                <Input
                  type="number"
                  min={0}
                  value={newItem.quantity}
                  onChange={(event) => setNewItem((current) => ({ ...current, quantity: event.target.value }))}
                />
              </Label>
              <Label className="w-24">
                Minimum
                <Input
                  type="number"
                  min={0}
                  value={newItem.minimumQuantity}
                  onChange={(event) => setNewItem((current) => ({ ...current, minimumQuantity: event.target.value }))}
                />
              </Label>
              <Label className="w-32">
                Applies to
                <Select
                  items={decantSizeOptions}
                  value={newItem.decantSizeMl}
                  onValueChange={(value) => setNewItem((current) => ({ ...current, decantSizeMl: (value as string) ?? SHARED_SIZE_VALUE }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {decantSizeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Label>
              <Button variant="secondary" loading={mutations.createPackagingItem.isPending} loadingText="Adding..." onClick={addItem}>
                <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={PlusSignIcon} strokeWidth={1.5} />
                Add item
              </Button>
            </div>
          </SectionWrapper>
        </div>
      </PageWrapper>
    </AdminShell>
  )
}
