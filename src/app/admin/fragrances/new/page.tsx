import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/common/access-denied"
import { FragranceCreateScreen } from "@/features/catalog/components/fragrance-create-screen"
import { requireAdmin } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

export default async function AdminNewFragrancePage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  if (!hasPermission(admin.role, "catalog.manage")) {
    return <AccessDenied user={admin} title="Fragrances" />
  }

  return <FragranceCreateScreen user={admin} />
}
