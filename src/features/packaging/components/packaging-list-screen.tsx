"use client"

import { useMemo, useState } from "react"
import { Package02Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { EmptyState } from "@/components/common/empty-state"
import { LoadingState } from "@/components/common/loading-state"
import { SearchInput } from "@/components/common/search-input"
import { StatusBadge, type StatusBadgeConfig } from "@/components/common/status-badge"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper, SectionWrapper, Toolbar } from "@/components/layouts/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import type { PackagingItem } from "@/types/packaging"

const stockStatusConfig: StatusBadgeConfig = {
  low: { label: "Low stock", variant: "warning" },
  ok: { label: "In stock", variant: "success" },
}

type PackagingListScreenProps = {
  user: { name: string; role: string }
}

type NewItemForm = { name: string; unit: string; unitCost: string; quantity: string; minimumQuantity: string }

export function PackagingListScreen({ user }: PackagingListScreenProps) {
  const items = usePackagingItems()
  const mutations = usePackagingMutations()
  const [searchQuery, setSearchQuery] = useState("")
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [rowEdits, setRowEdits] = useState<Record<string, { quantity: string; unitCost: string; minimumQuantity: string }>>({})
  const [error, setError] = useState("")
  const [newItem, setNewItem] = useState<NewItemForm>({ name: "", unit: "", unitCost: "", quantity: "", minimumQuantity: "" })

  const visibleItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return (items.data ?? []).filter((item) => {
      const isLow = item.quantity <= item.minimumQuantity
      const matchesStock = !lowStockOnly || isLow
      return matchesStock && (!query || item.name.toLowerCase().includes(query))
    })
  }, [items.data, searchQuery, lowStockOnly])

  function editValue(item: PackagingItem, field: "quantity" | "unitCost" | "minimumQuantity") {
    return rowEdits[item.id]?.[field] ?? String(item[field])
  }

  function setEditValue(item: PackagingItem, field: "quantity" | "unitCost" | "minimumQuantity", value: string) {
    setRowEdits((current) => ({
      ...current,
      [item.id]: {
        quantity: current[item.id]?.quantity ?? String(item.quantity),
        unitCost: current[item.id]?.unitCost ?? String(item.unitCost),
        minimumQuantity: current[item.id]?.minimumQuantity ?? String(item.minimumQuantity),
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

    try {
      await mutations.updatePackagingItem.mutateAsync({
        id: item.id,
        input: {
          quantity: Number(edit.quantity),
          unitCost: Number(edit.unitCost),
          minimumQuantity: Number(edit.minimumQuantity),
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
      })
      setNewItem({ name: "", unit: "", unitCost: "", quantity: "", minimumQuantity: "" })
      toast.add({ title: "Packaging item added.", type: "success" })
    } catch {
      setError("Could not add packaging item.")
    }
  }

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Packaging" }]} title="Packaging">
        <div className="grid gap-5">
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
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleItems.map((item) => {
                      const isLow = item.quantity <= item.minimumQuantity
                      const dirty = Boolean(rowEdits[item.id])

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="px-4 font-semibold text-foreground">{item.name}</TableCell>
                          <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                          <TableCell>
                            <Input
                              className="h-9 w-24"
                              type="number"
                              min={0}
                              value={editValue(item, "unitCost")}
                              onChange={(event) => setEditValue(item, "unitCost", event.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              className="h-9 w-24"
                              type="number"
                              min={0}
                              value={editValue(item, "quantity")}
                              onChange={(event) => setEditValue(item, "quantity", event.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              className="h-9 w-24"
                              type="number"
                              min={0}
                              value={editValue(item, "minimumQuantity")}
                              onChange={(event) => setEditValue(item, "minimumQuantity", event.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={isLow ? "low" : "ok"} config={stockStatusConfig} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!dirty}
                              loading={mutations.updatePackagingItem.isPending}
                              loadingText="Saving..."
                              onClick={() => saveRow(item)}
                            >
                              Save
                            </Button>
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
