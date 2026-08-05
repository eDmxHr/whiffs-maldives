import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/common/access-denied"
import { FragranceEditScreen } from "@/features/catalog/components/fragrance-edit-screen"
import { requireAdmin } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

export default async function AdminFragranceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  if (!hasPermission(admin.role, "catalog.manage")) {
    return <AccessDenied user={admin} title="Fragrances" />
  }

  const { id } = await params

  return <FragranceEditScreen user={admin} fragranceId={id} />
}
