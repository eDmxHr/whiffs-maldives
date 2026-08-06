"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { ArrowLeft02Icon, PerfumeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { LoadingState } from "@/components/common/loading-state"
import { AdminShell } from "@/components/layouts/admin-shell"
import { PageWrapper, SectionWrapper } from "@/components/layouts/page"
import { Button, buttonVariants } from "@/components/ui/button"
import { FormInput } from "@/components/forms/form-input"
import { FormSelect } from "@/components/forms/form-select"
import { FormTextarea } from "@/components/forms/form-textarea"
import { parseNotes } from "@/features/catalog/components/fragrance-create-screen"
import { useBrands, useCatalogMutations, useFragrance } from "@/features/catalog/hooks/use-catalog"

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

type FragranceEditScreenProps = {
  user: { name: string; role: string }
  fragranceId: string
}

function notesToString(notes: { pyramidLevel: string; position: number; name: string }[], pyramidLevel: string) {
  return notes
    .filter((note) => note.pyramidLevel === pyramidLevel)
    .sort((a, b) => a.position - b.position)
    .map((note) => note.name)
    .join(", ")
}

export function FragranceEditScreen({ user, fragranceId }: FragranceEditScreenProps) {
  const router = useRouter()
  const brands = useBrands()
  const fragrance = useFragrance(fragranceId)
  const mutations = useCatalogMutations()
  const brandItems = brands.data?.map((brand) => ({ label: brand.name, value: brand.id })) ?? []

  const form = useForm<FragranceForm>({
    defaultValues: {
      brandId: "",
      name: "",
      description: "",
      concentration: "",
      releaseYear: "",
      perfumer: "",
      gender: "",
      topNotes: "",
      heartNotes: "",
      baseNotes: "",
    },
  })

  useEffect(() => {
    if (fragrance.data) {
      form.reset({
        brandId: fragrance.data.brandId,
        name: fragrance.data.name,
        description: fragrance.data.description,
        concentration: fragrance.data.concentration,
        releaseYear: fragrance.data.releaseYear ? String(fragrance.data.releaseYear) : "",
        perfumer: fragrance.data.perfumer,
        gender: fragrance.data.gender,
        topNotes: notesToString(fragrance.data.notes, "top"),
        heartNotes: notesToString(fragrance.data.notes, "heart"),
        baseNotes: notesToString(fragrance.data.notes, "base"),
      })
    }
  }, [fragrance.data, form])

  async function submit(values: FragranceForm) {
    await mutations.updateFragrance.mutateAsync({
      fragranceId,
      input: {
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
      },
    })

    router.push(`/admin/fragrances/${fragranceId}`)
  }

  const backAction = (
    <Link className={buttonVariants({ variant: "outline" })} href={`/admin/fragrances/${fragranceId}`}>
      <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={ArrowLeft02Icon} strokeWidth={1.5} />
      Back to fragrance
    </Link>
  )

  return (
    <AdminShell brand="Whiffs Maldives" user={user}>
      <PageWrapper
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Fragrances", href: "/admin/fragrances" },
          { label: fragrance.data?.name ?? "Fragrance", href: `/admin/fragrances/${fragranceId}` },
          { label: "Edit" },
        ]}
        title="Edit fragrance"
        actions={backAction}
      >
        {fragrance.isLoading ? (
          <LoadingState label="Loading fragrance..." />
        ) : (
          <SectionWrapper
            headerEyebrow="Catalog record"
            title="Fragrance details"
            icon={PerfumeIcon}
          >
            <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
              <FormSelect
                control={form.control}
                name="brandId"
                label="Brand"
                items={brandItems}
                placeholder="Select brand"
                groupLabel="Brands"
                rules={{ required: "Select a brand." }}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormInput control={form.control} name="name" label="Name" rules={{ required: "Enter a fragrance name." }} />
                <FormInput control={form.control} name="concentration" label="Concentration" />
              </div>

              <FormTextarea
                control={form.control}
                name="description"
                label="Description"
                rules={{ required: "Enter a description.", minLength: { value: 10, message: "Use at least 10 characters." } }}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <FormInput control={form.control} name="perfumer" label="Perfumer" />
                <FormInput control={form.control} name="gender" label="Gender" />
                <FormInput control={form.control} name="releaseYear" label="Release year" type="number" />
              </div>

              <div className="grid gap-4">
                <FormInput control={form.control} name="topNotes" label="Top notes" placeholder="Comma separated" />
                <FormInput control={form.control} name="heartNotes" label="Heart notes" placeholder="Comma separated" />
                <FormInput control={form.control} name="baseNotes" label="Base notes" placeholder="Comma separated" />
              </div>

              <Button className="w-fit" type="submit" loading={mutations.updateFragrance.isPending} loadingText="Saving changes...">
                Save changes
              </Button>
            </form>
          </SectionWrapper>
        )}
      </PageWrapper>
    </AdminShell>
  )
}
