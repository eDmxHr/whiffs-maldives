import { redirect } from "next/navigation"

import { BottleListScreen } from "@/features/inventory/components/bottle-list-screen"
import { requireAdmin } from "@/lib/auth"

export default async function AdminBottlesPage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  return <BottleListScreen user={admin} />
}
