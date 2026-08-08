import { apiClient } from "@/lib/api-client"
import type { ApiCollection, ApiSuccess } from "@/types/api"
import type { CustomerDetail, CustomerView } from "@/types/customers"

export interface CreateCustomerInput {
  name: string
  phone: string
  email?: string
  notes?: string
}

export async function getCustomers() {
  const { data } = await apiClient.get<ApiCollection<CustomerView>>("/customers")
  return data.data
}

export async function getCustomer(id: string) {
  const { data } = await apiClient.get<ApiSuccess<CustomerDetail>>(`/customers/${id}`)
  return data.data
}

export async function createCustomer(input: CreateCustomerInput) {
  const { data } = await apiClient.post<ApiSuccess<CustomerView>>("/customers", input)
  return data.data
}
