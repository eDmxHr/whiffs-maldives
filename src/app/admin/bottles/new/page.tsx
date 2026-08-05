import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/common/access-denied"
import { BottleCreateScreen } from "@/features/inventory/components/bottle-create-screen"
import { requireAdmin } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

export default async function AdminNewBottlePage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  if (!hasPermission(admin.role, "inventory.create")) {
    return <AccessDenied user={admin} title="Bottles" />
  }

  return <BottleCreateScreen user={admin} />
}
