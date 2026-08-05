"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { ArrowLeft02Icon, MilkBottleIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { AdminShell } from "@/components/layouts/admin-shell"
import { Inspector, PageWrapper, SectionWrapper } from "@/components/layouts/page"
import { Button, buttonVariants } from "@/components/ui/button"
import { FormInput } from "@/components/forms/form-input"
import { FormSelect } from "@/components/forms/form-select"
import { useCatalogMutations, useFragrances, useSuppliers } from "@/features/catalog/hooks/use-catalog"

type SupplierForm = { name: string; phone: string; email: string; notes: string }
type BottleForm = {
  fragranceId: string
  supplierId: string
  originalVolumeMl: number
  usableVolumeMl: number
  purchasePrice: number
  purchaseDate: string
  notes: string
}

type BottleCreateScreenProps = {
  user: { name: string; role: string }
}

export function BottleCreateScreen({ user }: BottleCreateScreenProps) {
  const router = useRouter()
  const fragrances = useFragrances()
  const suppliers = useSuppliers()
  const mutations = useCatalogMutations()
  const [notice, setNotice] = useState("")

  const fragranceItems =
    fragrances.data?.map((fragrance) => ({ label: `${fragrance.brand.name} - ${fragrance.name}`, value: fragrance.id })) ?? []
  const supplierItems = suppliers.data?.map((supplier) => ({ label: supplier.name, value: supplier.id })) ?? []

  const supplierForm = useForm<SupplierForm>({ defaultValues: { name: "", phone: "", email: "", notes: "" } })
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

  async function submitSupplier(values: SupplierForm) {
    const supplier = await mutations.createSupplier.mutateAsync(values)
    bottleForm.setValue("supplierId", supplier.id, { shouldDirty: true, shouldValidate: true })
    await suppliers.refetch()
    supplierForm.reset()
    setNotice("Supplier created and selected.")
  }

  async function submitBottle(values: BottleForm) {
    if (!values.fragranceId) {
      bottleForm.setError("fragranceId", { type: "required", message: "Select a fragrance first." })
      return
    }

    if (!values.supplierId) {
      bottleForm.setError("supplierId", { type: "required", message: "Select or create a supplier first." })
      return
    }

    await mutations.createBottle.mutateAsync({
      ...values,
      originalVolumeMl: Number(values.originalVolumeMl),
      usableVolumeMl: Number(values.usableVolumeMl),
      purchasePrice: Number(values.purchasePrice),
    })

    router.push("/admin/bottles")
  }

  const backAction = (
    <Link className={buttonVariants({ variant: "outline" })} href="/admin/bottles">
      <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={ArrowLeft02Icon} strokeWidth={1.5} />
      Back to bottles
    </Link>
  )

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Bottles", href: "/admin/bottles" }, { label: "Add bottle" }]}
        title="Add bottle"
        description="Record a new bottle intake and attach it to a fragrance and supplier."
        actions={backAction}
      >
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionWrapper
            headerEyebrow="Inventory"
            title="Bottle details"
            icon={<HugeiconsIcon aria-hidden="true" className="size-5 text-admin-reef" icon={MilkBottleIcon} strokeWidth={1.5} />}
          >
            {notice ? <div className="mb-4 rounded-xl bg-admin-champagne/12 px-4 py-3 text-sm font-medium text-[color-mix(in_oklch,var(--admin-champagne),black_35%)]">{notice}</div> : null}

            <form className="grid gap-4" onSubmit={bottleForm.handleSubmit(submitBottle)}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormSelect
                  control={bottleForm.control}
                  name="fragranceId"
                  label="Fragrance"
                  items={fragranceItems}
                  placeholder="Select fragrance"
                  groupLabel="Fragrances"
                  rules={{ required: "Select a fragrance first." }}
                />
                <FormSelect
                  control={bottleForm.control}
                  name="supplierId"
                  label="Supplier"
                  items={supplierItems}
                  placeholder="Select supplier"
                  groupLabel="Suppliers"
                  rules={{ required: "Select or create a supplier first." }}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormInput control={bottleForm.control} name="purchasePrice" label="Bottle cost" type="number" rules={{ valueAsNumber: true }} />
                <FormInput control={bottleForm.control} name="purchaseDate" label="Purchase date" type="date" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormInput control={bottleForm.control} name="originalVolumeMl" label="Original ml" type="number" rules={{ valueAsNumber: true }} />
                <FormInput control={bottleForm.control} name="usableVolumeMl" label="Usable ml" type="number" rules={{ valueAsNumber: true }} />
              </div>

              <FormInput control={bottleForm.control} name="notes" label="Notes" />

              <Button className="w-fit" type="submit" loading={mutations.createBottle.isPending} loadingText="Adding bottle...">
                <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={PlusSignIcon} strokeWidth={1.5} />
                Add bottle
              </Button>
            </form>
          </SectionWrapper>

          <Inspector>
            <div className="px-3 pt-2 pb-3">
              <p className="text-xs font-semibold tracking-[0.18em] text-admin-champagne uppercase">Supplier</p>
              <h2 className="mt-1 text-lg font-semibold">Create supplier</h2>
            </div>
            <div className="flex flex-1 flex-col rounded-xl bg-background p-4 md:p-5">
              <form className="grid gap-4" onSubmit={supplierForm.handleSubmit(submitSupplier)}>
                <FormInput
                  control={supplierForm.control}
                  name="name"
                  label="Name"
                  rules={{ required: "Enter a supplier name.", minLength: { value: 2, message: "Use at least 2 characters." } }}
                />
                <FormInput control={supplierForm.control} name="phone" label="Phone" />
                <FormInput control={supplierForm.control} name="email" label="Email" type="email" />
                <FormInput control={supplierForm.control} name="notes" label="Notes" />
                <Button type="submit" variant="secondary" loading={mutations.createSupplier.isPending} loadingText="Creating supplier...">
                  <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={PlusSignIcon} strokeWidth={1.5} />
                  Create supplier
                </Button>
              </form>
            </div>
          </Inspector>
        </div>
      </PageWrapper>
    </AdminShell>
  )
}
