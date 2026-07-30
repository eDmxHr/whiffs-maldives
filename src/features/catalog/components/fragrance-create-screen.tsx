"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { ArrowLeft02Icon, PerfumeIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { AdminShell } from "@/components/layouts/admin-shell"
import { Inspector, PageWrapper, SectionWrapper } from "@/components/layouts/page"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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

function parseNotes(value: string, pyramidLevel: "top" | "heart" | "base") {
  return value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name, index) => ({ name, category: "", pyramidLevel, position: index + 1 }))
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs font-medium text-destructive">{message}</p> : null
}

export function FragranceCreateScreen({ user }: FragranceCreateScreenProps) {
  const router = useRouter()
  const brands = useBrands()
  const mutations = useCatalogMutations()
  const [notice, setNotice] = useState("")
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
    setNotice("Brand created and selected.")
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
    <Link className={buttonVariants({ variant: "outline" })} href="/admin/fragrances">
      <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={ArrowLeft02Icon} strokeWidth={1.5} />
      Back to fragrances
    </Link>
  )

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Fragrances", href: "/admin/fragrances" }, { label: "Add fragrance" }]}
        title="Add fragrance"
        description="Create a draft catalog record and attach it to a brand."
        actions={backAction}
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionWrapper
            headerEyebrow="Catalog record"
            title="Fragrance details"
            icon={<HugeiconsIcon aria-hidden="true" className="size-5 text-admin-reef" icon={PerfumeIcon} strokeWidth={1.5} />}
          >
            {notice ? <div className="mb-4 rounded-xl bg-admin-champagne/12 px-4 py-3 text-sm font-medium text-[color-mix(in_oklch,var(--admin-champagne),black_35%)]">{notice}</div> : null}

            <form className="grid gap-4" onSubmit={fragranceForm.handleSubmit(submitFragrance)}>
              <Label>
                Brand
                <Controller
                  control={fragranceForm.control}
                  name="brandId"
                  rules={{ required: "Select or create a brand first." }}
                  render={({ field }) => (
                    <Select items={brandItems} name={field.name} value={field.value || null} onValueChange={(value) => field.onChange(value ?? "")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Brands</SelectLabel>
                          {brandItems.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={fragranceForm.formState.errors.brandId?.message} />
              </Label>

              <div className="grid gap-4 md:grid-cols-2">
                <Label>
                  Name
                  <Input {...fragranceForm.register("name", { required: "Enter a fragrance name." })} />
                  <FieldError message={fragranceForm.formState.errors.name?.message} />
                </Label>
                <Label>
                  Concentration
                  <Input {...fragranceForm.register("concentration")} />
                </Label>
              </div>

              <Label>
                Description
                <Textarea {...fragranceForm.register("description", { required: "Enter a description.", minLength: { value: 10, message: "Use at least 10 characters." } })} />
                <FieldError message={fragranceForm.formState.errors.description?.message} />
              </Label>

              <div className="grid gap-4 md:grid-cols-3">
                <Label>
                  Perfumer
                  <Input {...fragranceForm.register("perfumer")} />
                </Label>
                <Label>
                  Gender
                  <Input {...fragranceForm.register("gender")} />
                </Label>
                <Label>
                  Release year
                  <Input type="number" {...fragranceForm.register("releaseYear")} />
                </Label>
              </div>

              <Label>
                Notes
                <Input placeholder="Top notes, comma separated" {...fragranceForm.register("topNotes")} />
                <Input placeholder="Heart notes, comma separated" {...fragranceForm.register("heartNotes")} />
                <Input placeholder="Base notes, comma separated" {...fragranceForm.register("baseNotes")} />
              </Label>

              <Button className="w-fit" type="submit" loading={mutations.createFragrance.isPending} loadingText="Creating fragrance...">
                <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={PlusSignIcon} strokeWidth={1.5} />
                Create fragrance
              </Button>
            </form>
          </SectionWrapper>

          <Inspector>
            <div className="px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-admin-champagne">Brand</p>
              <h2 className="mt-1 text-lg font-semibold">Create brand</h2>
            </div>
            <div className="p-5">
              <form className="grid gap-4" onSubmit={brandForm.handleSubmit(submitBrand)}>
                <Label>
                  Name
                  <Input {...brandForm.register("name", { required: "Enter a brand name.", minLength: { value: 2, message: "Use at least 2 characters." } })} />
                  <FieldError message={brandForm.formState.errors.name?.message} />
                </Label>
                <Label>
                  Description
                  <Textarea {...brandForm.register("description")} />
                </Label>
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
