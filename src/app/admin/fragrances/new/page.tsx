import { redirect } from "next/navigation"

import { FragranceCreateScreen } from "@/features/catalog/components/fragrance-create-screen"
import { requireAdmin } from "@/lib/auth"

export default async function AdminNewFragrancePage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  return <FragranceCreateScreen user={admin} />
}
