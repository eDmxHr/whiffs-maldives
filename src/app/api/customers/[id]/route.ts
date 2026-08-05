import { requireAdmin } from "@/lib/auth"
import { fail, ok } from "@/lib/api-response"
import { demoStore } from "@/lib/demo-store"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    return fail("UNAUTHORIZED", "Sign in with an owner account to view customers.", 401)
  }

  const { id } = await context.params
  const customer = demoStore.getCustomer(id)

  if (!customer) {
    return fail("NOT_FOUND", "Customer was not found.", 404)
  }

  return ok(customer)
}
