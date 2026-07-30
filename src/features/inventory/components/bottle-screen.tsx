"use client"

import { Controller, useForm } from "react-hook-form"
import { HugeiconsIcon } from "@hugeicons/react"
import { MilkBottleIcon, PlusSignIcon } from "@hugeicons/core-free-icons"

import { StatusBadge, type StatusBadgeConfig } from "@/components/common/status-badge"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper, SectionWrapper } from "@/components/layouts/page"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBottles, useCatalogMutations, useFragrances, useSuppliers } from "@/features/catalog/hooks/use-catalog"
import { money } from "@/lib/money"

type BottleForm = {
  fragranceId: string
  supplierId: string
  originalVolumeMl: number
  usableVolumeMl: number
  purchasePrice: number
  purchaseDate: string
  notes: string
}

const bottleStatusConfig: StatusBadgeConfig = {
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

type BottleScreenProps = {
  user: { name: string; role: string }
}

export function BottleScreen({ user }: BottleScreenProps) {
  const fragrances = useFragrances()
  const suppliers = useSuppliers()
  const bottles = useBottles()
  const mutations = useCatalogMutations()

  const bottleForm = useForm<BottleForm>({
    defaultValues: {
      fragranceId: "",
      supplierId: "",
      originalVolumeMl: 100,
      usableVolumeMl: 96,
      purchasePrice: 1740,
      purchaseDate: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  })

  const availableBottleCount = bottles.data?.filter((bottle) => bottle.status === "available").length ?? 0

  async function submitBottle(values: BottleForm) {
    await mutations.createBottle.mutateAsync({
      ...values,
      fragranceId: values.fragranceId || fragrances.data?.[0]?.id || "",
      supplierId: values.supplierId || suppliers.data?.[0]?.id || "",
      originalVolumeMl: Number(values.originalVolumeMl),
      usableVolumeMl: Number(values.usableVolumeMl),
      purchasePrice: Number(values.purchasePrice),
    })
    bottleForm.reset({ ...bottleForm.getValues(), notes: "" })
  }

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Bottles" }]}
        title="Bottles"
        meta={<div className="text-sm text-muted-foreground">{availableBottleCount} available bottles</div>}
      >
        <div className="grid gap-5">
          <SectionWrapper headerEyebrow="Inventory" title="Bottle intake" icon={<HugeiconsIcon aria-hidden="true" className="size-5 text-admin-reef" icon={MilkBottleIcon} strokeWidth={1.5} />}>
            <form className="grid gap-3 md:grid-cols-3" onSubmit={bottleForm.handleSubmit(submitBottle)}>
              <Label>
                Fragrance
                <Controller
                  control={bottleForm.control}
                  name="fragranceId"
                  render={({ field }) => (
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fragrance" />
                      </SelectTrigger>
                      <SelectContent>
                        {fragrances.data?.map((fragrance) => (
                          <SelectItem key={fragrance.id} value={fragrance.id}>
                            {fragrance.brand.name} - {fragrance.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Label>
              <Label>
                Supplier
                <Controller
                  control={bottleForm.control}
                  name="supplierId"
                  render={({ field }) => (
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.data?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Label>
              <Label>
                Bottle cost
                <Input type="number" {...bottleForm.register("purchasePrice", { valueAsNumber: true })} />
              </Label>
              <Label>
                Purchase date
                <Input type="date" {...bottleForm.register("purchaseDate")} />
              </Label>
              <Label>
                Original ml
                <Input type="number" {...bottleForm.register("originalVolumeMl", { valueAsNumber: true })} />
              </Label>
              <Label>
                Usable ml
                <Input type="number" {...bottleForm.register("usableVolumeMl", { valueAsNumber: true })} />
              </Label>
              <Label>
                Notes
                <Input {...bottleForm.register("notes")} />
              </Label>
              <Button className="md:col-span-3 md:w-fit" type="submit" loading={mutations.createBottle.isPending} loadingText="Adding bottle...">
                <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={PlusSignIcon} />
                Add bottle
              </Button>
            </form>

            <div className="mt-5 grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))]">
              {bottles.data?.map((bottle) => (
                <Card key={bottle.id} className="p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 font-semibold">
                      {fragrances.data?.find((fragrance) => fragrance.id === bottle.fragranceId)?.name}
                    </div>
                    <StatusBadge status={bottle.status} config={bottleStatusConfig} />
                  </div>
                  <div className="mt-3 text-muted-foreground">
                    {money(bottle.purchasePrice)} - {bottle.remainingVolumeMl}/{bottle.usableVolumeMl} ml
                  </div>
                </Card>
              ))}
            </div>
          </SectionWrapper>
        </div>
      </PageWrapper>
    </AdminShell>
  )
}
