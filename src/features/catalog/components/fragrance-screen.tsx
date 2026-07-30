"use client"

import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { HugeiconsIcon } from "@hugeicons/react"
import { CalculatorIcon, CheckmarkCircle02Icon, Image02Icon, PerfumeIcon, PlusSignIcon } from "@hugeicons/core-free-icons"

/* eslint-disable @next/next/no-img-element */

import { EmptyState } from "@/components/common/empty-state"
import { MetricCard } from "@/components/common/metric-card"
import { StatusBadge, type StatusBadgeConfig } from "@/components/common/status-badge"
import { AdminShell } from "@/components/layouts/admin-shell"
import { Inspector, PageWrapper, SectionWrapper } from "@/components/layouts/page"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useBrands, useCatalogMutations, useFragrances } from "@/features/catalog/hooks/use-catalog"
import { calculateDecantPrice, DEFAULT_DECANT_SIZES } from "@/lib/pricing"
import { money } from "@/lib/money"
import type { Offering } from "@/types/catalog"

type BrandForm = { name: string; description: string }
type FragranceForm = {
  brandId: string
  name: string
  description: string
  concentration: string
  releaseYear?: number
  perfumer: string
  gender: string
  topNotes: string
  heartNotes: string
  baseNotes: string
}

const fragranceStatusConfig: StatusBadgeConfig = {
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

function parseNotes(value: string, pyramidLevel: "top" | "heart" | "base") {
  return value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name, index) => ({ name, category: "", pyramidLevel, position: index + 1 }))
}

type FragranceScreenProps = {
  user: { name: string; role: string }
}

export function FragranceScreen({ user }: FragranceScreenProps) {
  const [selectedFragranceId, setSelectedFragranceId] = useState<string>("")
  const [imageUrl, setImageUrl] = useState("")
  const [packagingCost, setPackagingCost] = useState(12)
  const [operationsBuffer, setOperationsBuffer] = useState(5)
  const [notice, setNotice] = useState("")

  const brands = useBrands()
  const fragrances = useFragrances()
  const mutations = useCatalogMutations()

  const selectedFragrance = useMemo(
    () => fragrances.data?.find((fragrance) => fragrance.id === selectedFragranceId) ?? fragrances.data?.[0],
    [fragrances.data, selectedFragranceId]
  )

  const brandForm = useForm<BrandForm>({ defaultValues: { name: "", description: "" } })
  const fragranceForm = useForm<FragranceForm>({
    defaultValues: {
      brandId: "",
      name: "",
      description: "",
      concentration: "Eau de Parfum",
      perfumer: "",
      gender: "Unisex",
      topNotes: "",
      heartNotes: "",
      baseNotes: "",
    },
  })

  const priceRows = DEFAULT_DECANT_SIZES.map((sizeMl) => {
    const result = calculateDecantPrice({
      bottleCost: 1740,
      usableVolumeMl: 96,
      decantSizeMl: sizeMl,
      packagingCost,
      operationsBuffer,
    })

    return {
      sizeMl,
      result,
      existing: selectedFragrance?.offerings.find((offering) => offering.sizeMl === sizeMl),
    }
  })

  const draftCount = fragrances.data?.filter((fragrance) => fragrance.status === "draft").length ?? 0
  const catalogValue = priceRows.reduce((total, row) => total + row.result.finalPrice, 0)

  async function submitBrand(values: BrandForm) {
    await mutations.createBrand.mutateAsync(values)
    brandForm.reset()
    setNotice("Brand created.")
  }

  async function submitFragrance(values: FragranceForm) {
    const created = await mutations.createFragrance.mutateAsync({
      brandId: values.brandId || brands.data?.[0]?.id || "",
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
    setSelectedFragranceId(created.id)
    fragranceForm.reset()
    setNotice("Fragrance created as draft.")
  }

  async function saveDefaultOfferings() {
    if (!selectedFragrance) return

    const offerings: Array<Pick<Offering, "sizeMl" | "price" | "suggestedPrice" | "isActive">> = priceRows.map(
      ({ sizeMl, result, existing }) => ({
        sizeMl,
        price: existing?.price ?? result.finalPrice,
        suggestedPrice: result.finalPrice,
        isActive: true,
      })
    )

    await mutations.saveOfferings.mutateAsync({ fragranceId: selectedFragrance.id, offerings })
    setNotice("2ml, 5ml, and 10ml offerings saved.")
  }

  async function addImage() {
    if (!selectedFragrance || !imageUrl) return
    await mutations.addFragranceImage.mutateAsync({ fragranceId: selectedFragrance.id, publicUrl: imageUrl })
    setImageUrl("")
    setNotice("Image added. Lowest position is the hero.")
  }

  async function moveHero(imageId: string) {
    if (!selectedFragrance) return
    const imageIds = [imageId, ...selectedFragrance.images.filter((image) => image.id !== imageId).map((image) => image.id)]
    await mutations.reorderFragranceImages.mutateAsync({ fragranceId: selectedFragrance.id, imageIds })
    setNotice("Hero image updated.")
  }

  async function publish() {
    if (!selectedFragrance) return
    await mutations.publishFragrance.mutateAsync(selectedFragrance.id)
    setNotice("Fragrance published to the customer site.")
  }

  const publishAction = (
    <Button loading={mutations.publishFragrance.isPending} loadingText="Publishing..." onClick={publish} disabled={!selectedFragrance}>
      <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={CheckmarkCircle02Icon} />
      Publish
    </Button>
  )

  return (
    <AdminShell brand="Whiffs Maldives" user={user} actions={publishAction}>
      <PageWrapper
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Fragrances" }]}
        title="Fragrances"
        actions={publishAction}
        meta={selectedFragrance ? <StatusBadge status={selectedFragrance.status} config={fragranceStatusConfig} /> : null}
      >
        <div className="grid gap-5">
          <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))]">
            <MetricCard
              label="Fragrances"
              value={String(fragrances.data?.length ?? 0)}
              detail={`${draftCount} draft records need readiness checks.`}
              icon={PerfumeIcon}
            />
            <MetricCard
              label="Offering set"
              value={money(catalogValue)}
              detail="Current 2ml, 5ml, and 10ml suggested total."
              icon={CalculatorIcon}
              tone="info"
            />
          </div>

          {notice ? (
            <div className="rounded-xl border border-admin-champagne/35 bg-admin-champagne/12 px-4 py-3 text-sm font-medium text-[color-mix(in_oklch,var(--admin-champagne),black_35%)]">
              {notice}
            </div>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid gap-5">
              <SectionWrapper headerEyebrow="Catalog setup" title="Identity and editorial spine" icon={<HugeiconsIcon aria-hidden="true" className="size-5 text-admin-reef" icon={PerfumeIcon} strokeWidth={1.5} />}>
                <div className="grid gap-5 md:grid-cols-2">
                  <form className="grid content-start gap-3" onSubmit={brandForm.handleSubmit(submitBrand)}>
                    <h3 className="text-sm font-semibold">Brand</h3>
                    <Label>
                      Name
                      <Input {...brandForm.register("name", { required: true })} />
                    </Label>
                    <Label>
                      Description
                      <Textarea {...brandForm.register("description")} />
                    </Label>
                    <Button type="submit" loading={mutations.createBrand.isPending} loadingText="Creating brand...">
                      <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={PlusSignIcon} />
                      Create brand
                    </Button>
                  </form>

                  <form className="grid content-start gap-3" onSubmit={fragranceForm.handleSubmit(submitFragrance)}>
                    <h3 className="text-sm font-semibold">Fragrance</h3>
                    <Label>
                      Brand
                      <Controller
                        control={fragranceForm.control}
                        name="brandId"
                        render={({ field }) => (
                          <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                            <SelectContent>
                              {brands.data?.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                  {brand.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </Label>
                    <Label>
                      Name
                      <Input {...fragranceForm.register("name", { required: true })} />
                    </Label>
                    <Label>
                      Description
                      <Textarea {...fragranceForm.register("description", { required: true })} />
                    </Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Label>
                        Concentration
                        <Input {...fragranceForm.register("concentration")} />
                      </Label>
                      <Label>
                        Gender
                        <Input {...fragranceForm.register("gender")} />
                      </Label>
                    </div>
                    <Label>
                      Notes
                      <Input placeholder="Top notes, comma separated" {...fragranceForm.register("topNotes")} />
                      <Input placeholder="Heart notes, comma separated" {...fragranceForm.register("heartNotes")} />
                      <Input placeholder="Base notes, comma separated" {...fragranceForm.register("baseNotes")} />
                    </Label>
                    <Button type="submit" loading={mutations.createFragrance.isPending} loadingText="Creating fragrance...">
                      <HugeiconsIcon aria-hidden="true" data-icon="inline-start" icon={PlusSignIcon} />
                      Create fragrance
                    </Button>
                  </form>
                </div>
              </SectionWrapper>

              <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                <SectionWrapper headerEyebrow="Media" title="Fragrance images" icon={<HugeiconsIcon aria-hidden="true" className="size-5 text-admin-reef" icon={Image02Icon} strokeWidth={1.5} />}>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      placeholder="Paste image URL for local slice"
                      value={imageUrl}
                      onChange={(event) => setImageUrl(event.target.value)}
                    />
                    <Button loading={mutations.addFragranceImage.isPending} loadingText="Adding..." onClick={addImage} disabled={!imageUrl}>
                      Add
                    </Button>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {selectedFragrance?.images.length ? (
                      selectedFragrance.images.map((image) => (
                        <Card key={image.id} className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-3 p-2">
                          <img className="h-16 w-16 rounded-lg object-cover" src={image.publicUrl} alt="" />
                          <div className="min-w-0 text-sm">
                            <div className="font-semibold">Position {image.position}</div>
                            <div className="truncate text-muted-foreground">{image.publicUrl}</div>
                          </div>
                          <Button variant="outline" size="sm" loading={mutations.reorderFragranceImages.isPending} onClick={() => moveHero(image.id)}>
                            Make hero
                          </Button>
                        </Card>
                      ))
                    ) : (
                      <EmptyState title="No images yet" description="Add a public image URL to validate the media row pattern." icon={Image02Icon} />
                    )}
                  </div>
                </SectionWrapper>

                <SectionWrapper headerEyebrow="Offerings" title="GST-inclusive pricing" icon={<HugeiconsIcon aria-hidden="true" className="size-5 text-admin-reef" icon={CalculatorIcon} strokeWidth={1.5} />}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Label>
                      Packaging cost
                      <Input type="number" value={packagingCost} onChange={(event) => setPackagingCost(Number(event.target.value))} />
                    </Label>
                    <Label>
                      Operations buffer
                      <Input type="number" value={operationsBuffer} onChange={(event) => setOperationsBuffer(Number(event.target.value))} />
                    </Label>
                  </div>
                  <div className="mt-5 overflow-x-auto rounded-xl border border-border/80">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/70 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2">Size</th>
                          <th className="px-3 py-2">Suggested</th>
                          <th className="px-3 py-2">GST</th>
                          <th className="px-3 py-2">Current</th>
                        </tr>
                      </thead>
                      <tbody>
                        {priceRows.map(({ sizeMl, result, existing }) => (
                          <tr key={sizeMl} className="border-t border-border/70">
                            <td className="px-3 py-3 font-semibold">{sizeMl}ml</td>
                            <td className="px-3 py-3">{money(result.finalPrice)}</td>
                            <td className="px-3 py-3">{money(result.gstAmount)}</td>
                            <td className="px-3 py-3 text-muted-foreground">{existing ? money(existing.price) : "Not saved"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button className="mt-4" loading={mutations.saveOfferings.isPending} loadingText="Saving offerings..." onClick={saveDefaultOfferings}>
                    Save 2ml, 5ml, 10ml
                  </Button>
                </SectionWrapper>
              </div>
            </div>

            <Inspector>
              <div className="border-b border-border/70 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-admin-champagne">Inspector</p>
                <h2 className="mt-1 text-lg font-semibold">Fragrance desk</h2>
              </div>
              <div className="p-5">
                <Select value={selectedFragrance?.id ?? ""} onValueChange={(value) => setSelectedFragranceId(value ?? "")}>
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

                {selectedFragrance ? (
                  <div className="mt-5 grid gap-4 text-sm">
                    <Card className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold">{selectedFragrance.brand.name}</div>
                          <div className="text-muted-foreground">{selectedFragrance.name}</div>
                        </div>
                        <StatusBadge status={selectedFragrance.status} config={fragranceStatusConfig} />
                      </div>
                    </Card>
                    <p className="leading-6 text-muted-foreground">{selectedFragrance.description}</p>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <Card className="p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Images</p>
                        <p className="mt-2 text-xl font-semibold">{selectedFragrance.images.length}</p>
                      </Card>
                      <Card className="p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Offerings</p>
                        <p className="mt-2 text-xl font-semibold">{selectedFragrance.offerings.length}</p>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <EmptyState title="No fragrance selected" description="Create or select a fragrance to populate the inspector." icon={PerfumeIcon} />
                )}
              </div>
            </Inspector>
          </div>
        </div>
      </PageWrapper>
    </AdminShell>
  )
}
