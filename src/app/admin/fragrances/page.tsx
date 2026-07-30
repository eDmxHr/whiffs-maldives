import { redirect } from "next/navigation"

import { FragranceScreen } from "@/features/catalog/components/fragrance-screen"
import { requireAdmin } from "@/lib/auth"

export default async function AdminFragrancesPage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  return <FragranceScreen user={admin} />
}
