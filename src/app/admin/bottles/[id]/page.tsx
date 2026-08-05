import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/common/access-denied"
import { BottleDetailScreen } from "@/features/inventory/components/bottle-detail-screen"
import { requireAdmin } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

export default async function AdminBottleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  if (!hasPermission(admin.role, "inventory.view")) {
    return <AccessDenied user={admin} title="Bottles" />
  }

  const { id } = await params

  return <BottleDetailScreen user={admin} bottleId={id} />
}
