import { apiClient } from "@/lib/api-client"
import type { ApiSuccess } from "@/types/api"
import type { Settings } from "@/types/settings"

export async function getSettings() {
  const { data } = await apiClient.get<ApiSuccess<Settings>>("/settings")
  return data.data
}

export async function updateSettings(input: Settings) {
  const { data } = await apiClient.patch<ApiSuccess<Settings>>("/settings", input)
  return data.data
}
