"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { ArrowLeft02Icon, PerfumeIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { IconLink } from "@/components/common/icon-link"
import { AdminShell } from "@/components/layouts/admin-shell"
import { Heading, Inspector, PageWrapper, SectionWrapper } from "@/components/layouts/page"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { FormInput } from "@/components/forms/form-input"
import { FormSelect } from "@/components/forms/form-select"
import { FormTextarea } from "@/components/forms/form-textarea"
import { useBrands, useCatalogMutations } from "@/features/catalog/hooks/use-catalog"

type BrandForm = { name: string; description: string }
type FragranceForm = {
  brandId: string
  name: string
  description: string
  concentration: string
  releaseYear: string
  perfumer: string
  gender: string
  topNotes: string
  heartNotes: string
  baseNotes: string
}

type FragranceCreateScreenProps = {
  user: { name: string; role: string }
}

export function parseNotes(value: string, pyramidLevel: "top" | "heart" | "base") {
  return value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name, index) => ({ name, category: "", pyramidLevel, position: index + 1 }))
}

export function FragranceCreateScreen({ user }: FragranceCreateScreenProps) {
  const router = useRouter()
  const brands = useBrands()
  const mutations = useCatalogMutations()
  const brandItems = brands.data?.map((brand) => ({ label: brand.name, value: brand.id })) ?? []

  const brandForm = useForm<BrandForm>({ defaultValues: { name: "", description: "" } })
  const fragranceForm = useForm<FragranceForm>({
    defaultValues: {
      brandId: "",
      name: "",
      description: "",
      concentration: "Eau de Parfum",
      releaseYear: "",
      perfumer: "",
      gender: "Unisex",
      topNotes: "",
      heartNotes: "",
      baseNotes: "",
    },
  })

  async function submitBrand(values: BrandForm) {
    const brand = await mutations.createBrand.mutateAsync(values)
    fragranceForm.setValue("brandId", brand.id, { shouldDirty: true, shouldValidate: true })
    await brands.refetch()
    brandForm.reset()
    toast.add({ title: "Brand created and selected.", type: "success" })
  }

  async function submitFragrance(values: FragranceForm) {
    if (!values.brandId) {
      fragranceForm.setError("brandId", { type: "required", message: "Select or create a brand first." })
      return
    }

    await mutations.createFragrance.mutateAsync({
      brandId: values.brandId,
      name: values.name,
      description: values.description,
      concentration: values.concentration,
      releaseYear: values.releaseYear ? Number(values.releaseYear) : undefined,
      perfumer: values.perfumer,
      gender: values.gender,
      notes: [
        ...parseNotes(values.topNotes, "top"),
        ...parseNotes(values.heartNotes, "heart"),
        ...parseNotes(values.baseNotes, "base"),
      ],
    })

    router.push("/admin/fragrances")
  }

  const backAction = (
    <IconLink href="/admin/fragrances" icon={ArrowLeft02Icon}>
      Back to fragrances
    </IconLink>
  )

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Fragrances", href: "/admin/fragrances" }, { label: "Add fragrance" }]}
        title="Add fragrance"
        description="Create a draft catalog record and attach it to a brand."
        actions={backAction}
      >
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionWrapper
            headerEyebrow="Catalog record"
            title="Fragrance details"
            icon={PerfumeIcon}
          >
            <form className="grid gap-4" onSubmit={fragranceForm.handleSubmit(submitFragrance)}>
              <FormSelect
                control={fragranceForm.control}
                name="brandId"
                label="Brand"
                items={brandItems}
                placeholder="Select brand"
                groupLabel="Brands"
                rules={{ required: "Select or create a brand first." }}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormInput
                  control={fragranceForm.control}
                  name="name"
                  label="Name"
                  rules={{ required: "Enter a fragrance name." }}
                />
                <FormInput control={fragranceForm.control} name="concentration" label="Concentration" />
              </div>

              <FormTextarea
                control={fragranceForm.control}
                name="description"
                label="Description"
                rules={{ required: "Enter a description.", minLength: { value: 10, message: "Use at least 10 characters." } }}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <FormInput control={fragranceForm.control} name="perfumer" label="Perfumer" />
                <FormInput control={fragranceForm.control} name="gender" label="Gender" />
                <FormInput control={fragranceForm.control} name="releaseYear" label="Release year" type="number" />
              </div>

              <div className="grid gap-4">
                <FormInput control={fragranceForm.control} name="topNotes" label="Top notes" placeholder="Comma separated" />
                <FormInput control={fragranceForm.control} name="heartNotes" label="Heart notes" placeholder="Comma separated" />
                <FormInput control={fragranceForm.control} name="baseNotes" label="Base notes" placeholder="Comma separated" />
              </div>

              <Button className="w-fit" type="submit" loading={mutations.createFragrance.isPending} loadingText="Creating fragrance...">
                <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={PlusSignIcon} strokeWidth={1.5} />
                Create fragrance
              </Button>
            </form>
          </SectionWrapper>

          <Inspector>
            <div className="px-3 pb-3 pt-2">
              <Heading size="section" eyebrow="Brand" title="Create brand" />
            </div>
            <div className="flex flex-1 flex-col rounded-xl bg-background p-4 md:p-5">
              <form className="grid gap-4" onSubmit={brandForm.handleSubmit(submitBrand)}>
                <FormInput
                  control={brandForm.control}
                  name="name"
                  label="Name"
                  rules={{ required: "Enter a brand name.", minLength: { value: 2, message: "Use at least 2 characters." } }}
                />
                <FormTextarea control={brandForm.control} name="description" label="Description" />
                <Button type="submit" variant="secondary" loading={mutations.createBrand.isPending} loadingText="Creating brand...">
                  <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={PlusSignIcon} strokeWidth={1.5} />
                  Create brand
                </Button>
              </form>
            </div>
          </Inspector>
        </div>
      </PageWrapper>
    </AdminShell>
  )
}
