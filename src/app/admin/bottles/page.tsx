import { redirect } from "next/navigation"

import { BottleScreen } from "@/features/inventory/components/bottle-screen"
import { requireAdmin } from "@/lib/auth"

export default async function AdminBottlesPage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  return <BottleScreen user={admin} />
}
