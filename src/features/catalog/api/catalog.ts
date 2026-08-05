import { apiClient } from "@/lib/api-client"
import type { ApiCollection, ApiSuccess } from "@/types/api"
import type { Bottle, Brand, FragranceImage, FragranceView, InventoryEvent, Offering, Supplier } from "@/types/catalog"

export async function getBrands() {
  const { data } = await apiClient.get<ApiCollection<Brand>>("/brands")
  return data.data
}

export async function createBrand(input: { name: string; description: string }) {
  const { data } = await apiClient.post<ApiSuccess<Brand>>("/brands", input)
  return data.data
}

export async function getFragrances(params?: { publishedOnly?: boolean }) {
  const { data } = await apiClient.get<ApiCollection<FragranceView>>("/fragrances", {
    params: params?.publishedOnly ? { status: "published" } : undefined,
  })
  return data.data
}

export async function getFragrance(idOrSlug: string) {
  const { data } = await apiClient.get<ApiSuccess<FragranceView>>(`/fragrances/${idOrSlug}`)
  return data.data
}

export type FragranceInput = {
  brandId: string
  name: string
  description: string
  concentration: string
  releaseYear?: number
  perfumer: string
  gender: string
  notes: Array<{ name: string; category: string; pyramidLevel: "top" | "heart" | "base"; position: number }>
}

export async function createFragrance(input: FragranceInput) {
  const { data } = await apiClient.post<ApiSuccess<FragranceView>>("/fragrances", input)
  return data.data
}

export async function updateFragrance(fragranceId: string, input: Partial<FragranceInput>) {
  const { data } = await apiClient.patch<ApiSuccess<FragranceView>>(`/fragrances/${fragranceId}`, input)
  return data.data
}

export async function archiveFragrance(fragranceId: string) {
  const { data } = await apiClient.post<ApiSuccess<FragranceView>>(`/fragrances/${fragranceId}/archive`)
  return data.data
}

export async function addFragranceImage(fragranceId: string, file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const { data } = await apiClient.post<ApiSuccess<FragranceImage>>(`/fragrances/${fragranceId}/images`, formData, {
    headers: { "Content-Type": undefined },
  })
  return data.data
}

export async function reorderFragranceImages(fragranceId: string, imageIds: string[]) {
  const { data } = await apiClient.patch<ApiCollection<FragranceImage>>(`/fragrances/${fragranceId}/images/reorder`, { imageIds })
  return data.data
}

export async function deleteFragranceImage(fragranceId: string, imageId: string) {
  const { data } = await apiClient.delete<ApiSuccess<{ deleted: boolean }>>(`/fragrances/${fragranceId}/images/${imageId}`)
  return data.data
}

export async function saveOfferings(
  fragranceId: string,
  offerings: Array<Pick<Offering, "sizeMl" | "price" | "suggestedPrice" | "isActive">>
) {
  const { data } = await apiClient.post<ApiSuccess<Offering[]>>(`/fragrances/${fragranceId}/offerings`, { offerings })
  return data.data
}

export async function publishFragrance(fragranceId: string) {
  const { data } = await apiClient.post<ApiSuccess<FragranceView>>(`/fragrances/${fragranceId}/publish`)
  return data.data
}

export async function getBottles() {
  const { data } = await apiClient.get<ApiCollection<Bottle>>("/bottles")
  return data.data
}

export async function getBottle(id: string) {
  const { data } = await apiClient.get<ApiSuccess<Bottle>>(`/bottles/${id}`)
  return data.data
}

export type BottleInput = {
  fragranceId: string
  supplierId: string
  originalVolumeMl: number
  usableVolumeMl: number
  purchasePrice: number
  purchaseDate: string
  notes: string
}

export async function createBottle(input: BottleInput) {
  const { data } = await apiClient.post<ApiSuccess<Bottle>>("/bottles", input)
  return data.data
}

export async function updateBottle(id: string, input: BottleInput) {
  const { data } = await apiClient.patch<ApiSuccess<Bottle>>(`/bottles/${id}`, input)
  return data.data
}

export async function adjustBottle(id: string, input: { quantityMl: number; reason: string }) {
  const { data } = await apiClient.post<ApiSuccess<Bottle>>(`/bottles/${id}/adjustments`, input)
  return data.data
}

export async function archiveBottle(id: string) {
  const { data } = await apiClient.post<ApiSuccess<Bottle>>(`/bottles/${id}/archive`)
  return data.data
}

export async function getBottleEvents(id: string) {
  const { data } = await apiClient.get<ApiCollection<InventoryEvent>>(`/bottles/${id}/events`)
  return data.data
}

export async function getSuppliers() {
  const { data } = await apiClient.get<ApiCollection<Supplier>>("/suppliers")
  return data.data
}

export async function createSupplier(input: { name: string; phone: string; email: string; notes: string }) {
  const { data } = await apiClient.post<ApiSuccess<Supplier>>("/suppliers", input)
  return data.data
}
