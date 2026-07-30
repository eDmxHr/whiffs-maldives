import { redirect } from "next/navigation"

import { AdminWorkspace } from "@/features/catalog/components/admin-workspace"
import { requireAdmin } from "@/lib/auth"

export default async function AdminPage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  return <AdminWorkspace />
}
