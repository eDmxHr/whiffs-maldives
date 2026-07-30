"use client"

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useBottles, useBrands, useCatalogMutations, useFragrances, useSuppliers } from "@/features/catalog/hooks/use-catalog"
import { calculateDecantPrice, DEFAULT_DECANT_SIZES } from "@/lib/pricing"
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
type BottleForm = {
  fragranceId: string
  supplierId: string
  originalVolumeMl: number
  usableVolumeMl: number
  purchasePrice: number
  purchaseDate: string
  notes: string
}

function parseNotes(value: string, pyramidLevel: "top" | "heart" | "base") {
  return value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name, index) => ({ name, category: "", pyramidLevel, position: index + 1 }))
}

function money(value: number) {
  return `MVR ${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
}

export function AdminWorkspace() {
  const [selectedFragranceId, setSelectedFragranceId] = useState("fragrance_sauvage")
  const [imageUrl, setImageUrl] = useState("")
  const [packagingCost, setPackagingCost] = useState(12)
  const [operationsBuffer, setOperationsBuffer] = useState(5)
  const [notice, setNotice] = useState("")

  const brands = useBrands()
  const fragrances = useFragrances()
  const suppliers = useSuppliers()
  const bottles = useBottles()
  const mutations = useCatalogMutations()

  const selectedFragrance = useMemo(
    () => fragrances.data?.find((fragrance) => fragrance.id === selectedFragranceId) ?? fragrances.data?.[0],
    [fragrances.data, selectedFragranceId]
  )

  const selectedBottle = useMemo(
    () => bottles.data?.find((bottle) => bottle.fragranceId === selectedFragrance?.id),
    [bottles.data, selectedFragrance?.id]
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
  const bottleForm = useForm<BottleForm>({
    defaultValues: {
      fragranceId: selectedFragranceId,
      supplierId: "supplier_default",
      originalVolumeMl: 100,
      usableVolumeMl: 96,
      purchasePrice: 1740,
      purchaseDate: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  })

  const watchedPurchasePrice = useWatch({ control: bottleForm.control, name: "purchasePrice" })
  const watchedUsableVolume = useWatch({ control: bottleForm.control, name: "usableVolumeMl" })

  const priceRows = DEFAULT_DECANT_SIZES.map((sizeMl) => {
    const sourceBottle =
      selectedBottle ??
      ({
        purchasePrice: Number(watchedPurchasePrice) || 0,
        usableVolumeMl: Number(watchedUsableVolume) || 96,
      } as const)

    const result = calculateDecantPrice({
      bottleCost: sourceBottle.purchasePrice,
      usableVolumeMl: sourceBottle.usableVolumeMl,
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

  async function submitBottle(values: BottleForm) {
    await mutations.createBottle.mutateAsync({
      ...values,
      fragranceId: selectedFragrance?.id ?? values.fragranceId,
      supplierId: values.supplierId || suppliers.data?.[0]?.id || "",
      originalVolumeMl: Number(values.originalVolumeMl),
      usableVolumeMl: Number(values.usableVolumeMl),
      purchasePrice: Number(values.purchasePrice),
    })
    setNotice("Bottle added with an initial inventory event.")
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

  return (
    <div className="min-h-svh bg-[#f8f6ef] text-[#22231f]">
      <div className="grid min-h-svh grid-cols-1 lg:grid-cols-[248px_1fr]">
        <aside className="border-b border-[#d8d0bd] bg-[#12352d] p-6 text-[#fbf8ef] lg:border-b-0 lg:border-r">
          <div className="text-xl font-semibold tracking-wide">Whiffs Maldives</div>
          <p className="mt-2 text-sm text-[#d8d0bd]">Owner workspace</p>
          <nav className="mt-8 grid gap-2 text-sm">
            <a className="rounded-lg bg-white/10 px-3 py-2" href="#catalog">
              Catalog
            </a>
            <a className="rounded-lg px-3 py-2 text-[#d8d0bd] hover:bg-white/10" href="#pricing">
              Offerings
            </a>
            <a className="rounded-lg px-3 py-2 text-[#d8d0bd] hover:bg-white/10" href="#inventory">
              Bottle inventory
            </a>
          </nav>
        </aside>

        <main className="min-w-0 p-5 md:p-8">
          <header className="flex flex-col justify-between gap-4 border-b border-[#d8d0bd] pb-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7c6a3d]">First vertical slice</p>
              <h1 className="mt-2 font-heading text-3xl font-semibold md:text-5xl">Publishable fragrance spine</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#656052]">
                Create the catalog record, attach images, calculate GST-inclusive decant prices, add bottle inventory,
                then publish the fragrance for customers.
              </p>
            </div>
            <Button onClick={publish} disabled={!selectedFragrance || mutations.publishFragrance.isPending}>
              Publish
            </Button>
          </header>

          {notice ? (
            <div className="mt-5 rounded-lg border border-[#c8b46b] bg-[#fffaf0] px-4 py-3 text-sm text-[#4d3e14]">
              {notice}
            </div>
          ) : null}

          <section className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]" id="catalog">
            <Card className="border-[#ddd5c3] bg-white p-5">
              <h2 className="font-heading text-2xl font-semibold">Catalog setup</h2>
              <div className="mt-5 grid gap-6 md:grid-cols-2">
                <form className="grid gap-3" onSubmit={brandForm.handleSubmit(submitBrand)}>
                  <h3 className="font-medium">Brand</h3>
                  <Label>
                    Name
                    <Input {...brandForm.register("name", { required: true })} />
                  </Label>
                  <Label>
                    Description
                    <Textarea {...brandForm.register("description")} />
                  </Label>
                  <Button type="submit">Create brand</Button>
                </form>

                <form className="grid gap-3" onSubmit={fragranceForm.handleSubmit(submitFragrance)}>
                  <h3 className="font-medium">Fragrance</h3>
                  <Label>
                    Brand
                    <Select {...fragranceForm.register("brandId")}>
                      {brands.data?.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </Select>
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
                  <Button type="submit">Create fragrance</Button>
                </form>
              </div>
            </Card>

            <Card className="border-[#ddd5c3] bg-white p-5">
              <h2 className="font-heading text-2xl font-semibold">Fragrance desk</h2>
              <Select
                className="mt-5"
                value={selectedFragrance?.id ?? ""}
                onChange={(event) => setSelectedFragranceId(event.target.value)}
              >
                {fragrances.data?.map((fragrance) => (
                  <option key={fragrance.id} value={fragrance.id}>
                    {fragrance.brand.name} · {fragrance.name}
                  </option>
                ))}
              </Select>
              {selectedFragrance ? (
                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f8f6ef] p-4">
                    <div>
                      <div className="font-medium">{selectedFragrance.brand.name}</div>
                      <div className="text-muted-foreground">{selectedFragrance.name}</div>
                    </div>
                    <Badge variant="luxury">{selectedFragrance.status}</Badge>
                  </div>
                  <p className="leading-6 text-[#656052]">{selectedFragrance.description}</p>
                </div>
              ) : null}
            </Card>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]" id="pricing">
            <Card className="border-[#ddd5c3] bg-white p-5">
              <h2 className="font-heading text-2xl font-semibold">Images</h2>
              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="Paste image URL for local slice"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                />
                <Button onClick={addImage}>Add</Button>
              </div>
              <div className="mt-4 grid gap-3">
                {selectedFragrance?.images.map((image) => (
                  <div key={image.id} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 rounded-xl border border-[#e5dece] p-2">
                    <img className="h-16 w-16 rounded-lg object-cover" src={image.publicUrl} alt="" />
                    <div className="min-w-0 text-sm">
                      <div className="font-medium">Position {image.position}</div>
                      <div className="truncate text-muted-foreground">{image.publicUrl}</div>
                    </div>
                    <Button variant="outline" onClick={() => moveHero(image.id)}>
                      Make hero
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-[#ddd5c3] bg-white p-5">
              <h2 className="font-heading text-2xl font-semibold">GST-inclusive offerings</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Label>
                  Packaging cost
                  <Input type="number" value={packagingCost} onChange={(event) => setPackagingCost(Number(event.target.value))} />
                </Label>
                <Label>
                  Operations buffer
                  <Input type="number" value={operationsBuffer} onChange={(event) => setOperationsBuffer(Number(event.target.value))} />
                </Label>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#ddd5c3] text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="py-2">Size</th>
                      <th className="py-2">Suggested</th>
                      <th className="py-2">GST included</th>
                      <th className="py-2">Current</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceRows.map(({ sizeMl, result, existing }) => (
                      <tr key={sizeMl} className="border-b border-[#eee8da]">
                        <td className="py-3 font-medium">{sizeMl}ml</td>
                        <td className="py-3">{money(result.finalPrice)}</td>
                        <td className="py-3">{money(result.gstAmount)}</td>
                        <td className="py-3">{existing ? money(existing.price) : "Not saved"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button className="mt-4" onClick={saveDefaultOfferings}>
                Save 2ml, 5ml, 10ml
              </Button>
            </Card>
          </section>

          <Card className="mt-5 border-[#ddd5c3] bg-white p-5" id="inventory">
            <h2 className="font-heading text-2xl font-semibold">Bottle inventory</h2>
            <form className="mt-5 grid gap-3 md:grid-cols-3" onSubmit={bottleForm.handleSubmit(submitBottle)}>
              <Label>
                Supplier
                <Select {...bottleForm.register("supplierId")}>
                  {suppliers.data?.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </Select>
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
              <Button type="submit">Add bottle</Button>
            </form>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {bottles.data?.map((bottle) => (
                <div key={bottle.id} className="rounded-xl border border-[#e5dece] p-4 text-sm">
                  <div className="font-medium">{fragrances.data?.find((fragrance) => fragrance.id === bottle.fragranceId)?.name}</div>
                  <div className="mt-2 text-muted-foreground">
                    {money(bottle.purchasePrice)} · {bottle.remainingVolumeMl}/{bottle.usableVolumeMl} ml
                  </div>
                  <Badge className="mt-3 bg-[#f8f6ef] text-[#12352d]" variant="secondary">{bottle.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
