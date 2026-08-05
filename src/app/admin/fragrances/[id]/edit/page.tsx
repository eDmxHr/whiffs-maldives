import { redirect } from "next/navigation"

import { FragranceEditScreen } from "@/features/catalog/components/fragrance-edit-screen"
import { requireAdmin } from "@/lib/auth"

export default async function AdminFragranceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  const { id } = await params

  return <FragranceEditScreen user={admin} fragranceId={id} />
}
