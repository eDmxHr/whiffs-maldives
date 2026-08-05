import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/common/access-denied"
import { FragranceDetailScreen } from "@/features/catalog/components/fragrance-detail-screen"
import { requireAdmin } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

export default async function AdminFragranceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  if (!hasPermission(admin.role, "catalog.view")) {
    return <AccessDenied user={admin} title="Fragrances" />
  }

  const { id } = await params

  return <FragranceDetailScreen user={admin} fragranceId={id} />
}
