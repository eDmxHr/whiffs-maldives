"use client"

import { useState } from "react"
import { Cancel01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCatalogMutations } from "@/features/catalog/hooks/use-catalog"
import { usePackagingItems } from "@/features/packaging/hooks/use-packaging"
import { useSettings } from "@/features/settings/hooks/use-settings"
import { earliestAvailableBottle } from "@/lib/inventory"
import { money } from "@/lib/money"
import { calculateDecantPrice } from "@/lib/pricing"
import type { Bottle, Offering } from "@/types/catalog"

type OfferingRow = Pick<Offering, "sizeMl" | "price" | "suggestedPrice" | "isActive">

type OfferingsEditorProps = {
  fragranceId: string
  offerings: Offering[]
  bottles: Bottle[]
}

function toRows(offerings: Offering[]): OfferingRow[] {
  return offerings
    .map((offering) => ({
      sizeMl: offering.sizeMl,
      price: offering.price,
      suggestedPrice: offering.suggestedPrice,
      isActive: offering.isActive,
    }))
    .sort((a, b) => a.sizeMl - b.sizeMl)
}

export function OfferingsEditor({ fragranceId, offerings, bottles }: OfferingsEditorProps) {
  const mutations = useCatalogMutations()
  const settings = useSettings()
  const packagingItems = usePackagingItems()
  const [rows, setRows] = useState<OfferingRow[]>(() => toRows(offerings))
  const [newSize, setNewSize] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [error, setError] = useState("")

  const suggestionBottle = earliestAvailableBottle(bottles)

  const activePackagingItems = packagingItems.data?.filter((item) => item.isActive) ?? []

  // Packaging cost for a given decant size = shared items (decantSizeMl null) + items
  // specific to that size (e.g. the 2ml atomizer), not every active item indiscriminately.
  function packagingItemsForSize(sizeMl: number) {
    return activePackagingItems.filter((item) => item.decantSizeMl === null || item.decantSizeMl === sizeMl)
  }

  function packagingCostForSize(sizeMl: number) {
    if (activePackagingItems.length === 0) {
      return settings.data?.packagingCost ?? 0
    }

    return packagingItemsForSize(sizeMl).reduce((sum, item) => sum + item.unitCost, 0)
  }

  const previewSizeMl = Number(newSize)
  const hasPreviewSize = Boolean(previewSizeMl && previewSizeMl > 0)

  function suggestPrice() {
    setError("")
    const sizeMl = Number(newSize)

    if (!sizeMl || sizeMl <= 0) {
      setError("Enter a size in ml before suggesting a price.")
      return
    }

    if (!suggestionBottle || !settings.data) {
      setError("No available bottle to price this size from yet.")
      return
    }

    const result = calculateDecantPrice({
      bottleCost: suggestionBottle.purchasePrice,
      usableVolumeMl: suggestionBottle.usableVolumeMl,
      decantSizeMl: sizeMl,
      packagingCost: packagingCostForSize(sizeMl),
      operationsBuffer: settings.data.operationsBuffer,
      grossMargin: settings.data.targetGrossMarginPercent / 100,
      gstRate: settings.data.gstEnabled ? settings.data.gstRatePercent / 100 : 0,
      roundingIncrement: settings.data.priceRoundingIncrement,
    })

    setNewPrice(String(result.finalPrice))
  }

  function addRow() {
    setError("")
    const sizeMl = Number(newSize)
    const price = Number(newPrice)

    if (!sizeMl || sizeMl <= 0) {
      setError("Enter a size in ml greater than zero.")
      return
    }

    if (rows.some((row) => row.sizeMl === sizeMl)) {
      setError(`A ${sizeMl}ml offering already exists.`)
      return
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price.")
      return
    }

    setRows((current) => [...current, { sizeMl, price, suggestedPrice: price, isActive: true }].sort((a, b) => a.sizeMl - b.sizeMl))
    setNewSize("")
    setNewPrice("")
  }

  function removeRow(sizeMl: number) {
    setRows((current) => current.filter((row) => row.sizeMl !== sizeMl))
  }

  function toggleActive(sizeMl: number) {
    setRows((current) => current.map((row) => (row.sizeMl === sizeMl ? { ...row, isActive: !row.isActive } : row)))
  }

  function updatePrice(sizeMl: number, price: number) {
    setRows((current) => current.map((row) => (row.sizeMl === sizeMl ? { ...row, price } : row)))
  }

  async function save() {
    setError("")

    try {
      await mutations.saveOfferings.mutateAsync({ fragranceId, offerings: rows })
      toast.add({ title: "Offerings saved.", type: "success" })
    } catch (mutationError) {
      const message =
        mutationError && typeof mutationError === "object" && "message" in mutationError
          ? String((mutationError as { message: unknown }).message)
          : "Could not save offerings."
      setError(message)
    }
  }

  return (
    <div className="grid gap-4">
      {error ? (
        <div className="rounded-xl bg-admin-danger/12 px-4 py-3 text-sm font-medium text-admin-danger">{error}</div>
      ) : null}

      {rows.length ? (
        <div className="overflow-hidden rounded-xl bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Size</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Suggested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.sizeMl}>
                  <TableCell className="px-4 font-semibold text-foreground">{row.sizeMl}ml</TableCell>
                  <TableCell>
                    <Input
                      className="h-9 w-28"
                      type="number"
                      min={0}
                      value={row.price}
                      onChange={(event) => updatePrice(row.sizeMl, Number(event.target.value))}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{money(row.suggestedPrice)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant={row.isActive ? "secondary" : "outline"} onClick={() => toggleActive(row.sizeMl)}>
                      {row.isActive ? "Active" : "Inactive"}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon-sm" variant="ghost" aria-label={`Remove ${row.sizeMl}ml offering`} onClick={() => removeRow(row.sizeMl)}>
                      <HugeiconsIcon aria-hidden="true" icon={Cancel01Icon} strokeWidth={1.5} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No offerings yet. Add a size below.</p>
      )}

      <div className="flex flex-wrap items-end gap-3 rounded-xl bg-background p-4">
        <Label className="w-28">
          Size (ml)
          <Input type="number" min={0} value={newSize} onChange={(event) => setNewSize(event.target.value)} placeholder="3" />
        </Label>
        <Label className="w-32">
          Price (MVR)
          <Input type="number" min={0} value={newPrice} onChange={(event) => setNewPrice(event.target.value)} placeholder="180" />
        </Label>
        <Button
          type="button"
          variant="outline"
          disabled={!suggestionBottle}
          title={suggestionBottle ? undefined : "No available bottle to price this size from yet."}
          onClick={suggestPrice}
        >
          Suggest price
        </Button>
        <Button variant="secondary" onClick={addRow}>
          <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={PlusSignIcon} strokeWidth={1.5} />
          Add size
        </Button>
        <p className="w-full text-xs text-muted-foreground">
          {activePackagingItems.length === 0
            ? `Packaging cost: ${money(settings.data?.packagingCost ?? 0)} from the settings default (no active packaging items yet).`
            : hasPreviewSize
              ? (() => {
                  const items = packagingItemsForSize(previewSizeMl)
                  const sharedCount = items.filter((item) => item.decantSizeMl === null).length
                  const sizeSpecificCount = items.length - sharedCount

                  return `Packaging cost for ${previewSizeMl}ml: ${money(packagingCostForSize(previewSizeMl))} — ${sharedCount} shared item${sharedCount === 1 ? "" : "s"}${sizeSpecificCount ? ` + ${sizeSpecificCount} item${sizeSpecificCount === 1 ? "" : "s"} for ${previewSizeMl}ml` : ""}.`
                })()
              : "Enter a size above to see its packaging cost breakdown."}
        </p>
      </div>

      <Button
        className="w-fit"
        onClick={save}
        loading={mutations.saveOfferings.isPending}
        loadingText="Saving offerings..."
      >
        Save changes
      </Button>
    </div>
  )
}
