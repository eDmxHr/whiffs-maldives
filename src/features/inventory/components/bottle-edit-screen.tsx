"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { ArrowLeft02Icon, MilkBottleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { LoadingState } from "@/components/common/loading-state"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper, SectionWrapper } from "@/components/layouts/page"
import { Button, buttonVariants } from "@/components/ui/button"
import { FormInput } from "@/components/forms/form-input"
import { FormSelect } from "@/components/forms/form-select"
import { useBottle, useCatalogMutations, useFragrances, useSuppliers } from "@/features/catalog/hooks/use-catalog"

type BottleForm = {
  fragranceId: string
  supplierId: string
  originalVolumeMl: string
  usableVolumeMl: string
  purchasePrice: string
  purchaseDate: string
  notes: string
}

type BottleEditScreenProps = {
  user: { name: string; role: string }
  bottleId: string
}

export function BottleEditScreen({ user, bottleId }: BottleEditScreenProps) {
  const router = useRouter()
  const bottle = useBottle(bottleId)
  const fragrances = useFragrances()
  const suppliers = useSuppliers()
  const mutations = useCatalogMutations()

  const fragranceItems =
    fragrances.data?.map((fragrance) => ({ label: `${fragrance.brand.name} - ${fragrance.name}`, value: fragrance.id })) ?? []
  const supplierItems = suppliers.data?.map((supplier) => ({ label: supplier.name, value: supplier.id })) ?? []

  const form = useForm<BottleForm>({
    defaultValues: {
      fragranceId: "",
      supplierId: "",
      originalVolumeMl: "",
      usableVolumeMl: "",
      purchasePrice: "",
      purchaseDate: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (bottle.data) {
      form.reset({
        fragranceId: bottle.data.fragranceId,
        supplierId: bottle.data.supplierId,
        originalVolumeMl: String(bottle.data.originalVolumeMl),
        usableVolumeMl: String(bottle.data.usableVolumeMl),
        purchasePrice: String(bottle.data.purchasePrice),
        purchaseDate: bottle.data.purchaseDate,
        notes: bottle.data.notes,
      })
    }
  }, [bottle.data, form])

  async function submit(values: BottleForm) {
    await mutations.updateBottle.mutateAsync({
      id: bottleId,
      input: {
        fragranceId: values.fragranceId,
        supplierId: values.supplierId,
        originalVolumeMl: Number(values.originalVolumeMl),
        usableVolumeMl: Number(values.usableVolumeMl),
        purchasePrice: Number(values.purchasePrice),
        purchaseDate: values.purchaseDate,
        notes: values.notes,
      },
    })

    router.push(`/admin/bottles/${bottleId}`)
  }

  const backAction = (
    <Link className={buttonVariants({ variant: "outline" })} href={`/admin/bottles/${bottleId}`}>
      <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={ArrowLeft02Icon} strokeWidth={1.5} />
      Back to bottle
    </Link>
  )

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Bottles", href: "/admin/bottles" },
          { label: "Edit" },
        ]}
        title="Edit bottle"
        actions={backAction}
      >
        {bottle.isLoading ? (
          <LoadingState label="Loading bottle..." />
        ) : (
          <SectionWrapper
            headerEyebrow="Inventory"
            title="Bottle details"
            icon={MilkBottleIcon}
          >
            <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormSelect
                  control={form.control}
                  name="fragranceId"
                  label="Fragrance"
                  items={fragranceItems}
                  placeholder="Select fragrance"
                  groupLabel="Fragrances"
                  rules={{ required: "Select a fragrance first." }}
                />
                <FormSelect
                  control={form.control}
                  name="supplierId"
                  label="Supplier"
                  items={supplierItems}
                  placeholder="Select supplier"
                  groupLabel="Suppliers"
                  rules={{ required: "Select a supplier first." }}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormInput control={form.control} name="purchasePrice" label="Bottle cost" type="number" />
                <FormInput control={form.control} name="purchaseDate" label="Purchase date" type="date" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormInput control={form.control} name="originalVolumeMl" label="Original ml" type="number" />
                <FormInput control={form.control} name="usableVolumeMl" label="Usable ml" type="number" />
              </div>

              <FormInput control={form.control} name="notes" label="Notes" />

              <Button className="w-fit" type="submit" loading={mutations.updateBottle.isPending} loadingText="Saving changes...">
                Save changes
              </Button>
            </form>
          </SectionWrapper>
        )}
      </PageWrapper>
    </AdminShell>
  )
}
