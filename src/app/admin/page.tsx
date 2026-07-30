import { redirect } from "next/navigation"

import { DashboardScreen } from "@/features/dashboard/components/dashboard-screen"
import { requireAdmin } from "@/lib/auth"

export default async function AdminPage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  return <DashboardScreen user={admin} />
}
