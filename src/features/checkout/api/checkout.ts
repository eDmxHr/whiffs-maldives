import { apiClient } from "@/lib/api-client"
import type { ApiSuccess } from "@/types/api"
import type { GuestOrderConfirmation } from "@/types/orders"
import type { GuestCheckoutInput } from "@/features/checkout/schemas/checkout"

export async function submitGuestOrder(input: GuestCheckoutInput) {
  const { data } = await apiClient.post<ApiSuccess<GuestOrderConfirmation>>("/checkout", input)
  return data.data
}
