import { redirect } from "next/navigation"

import { BottleDetailScreen } from "@/features/inventory/components/bottle-detail-screen"
import { requireAdmin } from "@/lib/auth"

export default async function AdminBottleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  const { id } = await params

  return <BottleDetailScreen user={admin} bottleId={id} />
}
