import { redirect } from "next/navigation"

import { FragranceDetailScreen } from "@/features/catalog/components/fragrance-detail-screen"
import { requireAdmin } from "@/lib/auth"

export default async function AdminFragranceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  const { id } = await params

  return <FragranceDetailScreen user={admin} fragranceId={id} />
}
