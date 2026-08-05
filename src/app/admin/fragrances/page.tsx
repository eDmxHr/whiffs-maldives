import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/common/access-denied"
import { FragranceScreen } from "@/features/catalog/components/fragrance-screen"
import { requireAdmin } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

export default async function AdminFragrancesPage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  if (!hasPermission(admin.role, "catalog.view")) {
    return <AccessDenied user={admin} title="Fragrances" />
  }

  return <FragranceScreen user={admin} />
}
