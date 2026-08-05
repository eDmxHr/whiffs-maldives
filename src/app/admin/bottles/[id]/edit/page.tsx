import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/common/access-denied"
import { BottleEditScreen } from "@/features/inventory/components/bottle-edit-screen"
import { requireAdmin } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

export default async function AdminBottleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  if (!hasPermission(admin.role, "inventory.adjust")) {
    return <AccessDenied user={admin} title="Bottles" />
  }

  const { id } = await params

  return <BottleEditScreen user={admin} bottleId={id} />
}
