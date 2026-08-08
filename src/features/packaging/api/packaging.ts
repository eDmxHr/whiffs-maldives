import { apiClient } from "@/lib/api-client"
import type { ApiCollection, ApiSuccess } from "@/types/api"
import type { PackagingItem } from "@/types/packaging"

export type PackagingItemInput = Omit<PackagingItem, "id" | "isActive">

export async function getPackagingItems() {
  const { data } = await apiClient.get<ApiCollection<PackagingItem>>("/packaging-items")
  return data.data
}

export async function createPackagingItem(input: PackagingItemInput) {
  const { data } = await apiClient.post<ApiSuccess<PackagingItem>>("/packaging-items", input)
  return data.data
}

export async function updatePackagingItem(id: string, input: Partial<PackagingItemInput>) {
  const { data } = await apiClient.patch<ApiSuccess<PackagingItem>>(`/packaging-items/${id}`, input)
  return data.data
}

export async function archivePackagingItem(id: string) {
  const { data } = await apiClient.post<ApiSuccess<PackagingItem>>(`/packaging-items/${id}/archive`)
  return data.data
}

export async function restorePackagingItem(id: string) {
  const { data } = await apiClient.post<ApiSuccess<PackagingItem>>(`/packaging-items/${id}/restore`)
  return data.data
}
