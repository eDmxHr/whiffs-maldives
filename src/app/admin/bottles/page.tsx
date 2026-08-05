import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/common/access-denied"
import { BottleListScreen } from "@/features/inventory/components/bottle-list-screen"
import { requireAdmin } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

export default async function AdminBottlesPage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  if (!hasPermission(admin.role, "inventory.view")) {
    return <AccessDenied user={admin} title="Bottles" />
  }

  return <BottleListScreen user={admin} />
}
