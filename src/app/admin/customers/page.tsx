import { redirect } from "next/navigation"

import { CustomersScreen } from "@/features/customers/components/customers-screen"
import { requireAdmin } from "@/lib/auth"

export default async function AdminCustomersPage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  return <CustomersScreen user={admin} />
}
