import { apiClient } from "@/lib/api-client"
import type { ApiCollection, ApiSuccess } from "@/types/api"
import type { AdminUser } from "@/types/users"

export async function getUsers() {
  const { data } = await apiClient.get<ApiCollection<AdminUser>>("/users")
  return data.data
}

export async function updateUserRole(id: string, role: AdminUser["role"]) {
  const { data } = await apiClient.patch<ApiSuccess<AdminUser>>(`/users/${id}/role`, { role })
  return data.data
}
