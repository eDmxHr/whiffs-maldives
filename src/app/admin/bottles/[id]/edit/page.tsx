import { redirect } from "next/navigation"

import { BottleEditScreen } from "@/features/inventory/components/bottle-edit-screen"
import { requireAdmin } from "@/lib/auth"

export default async function AdminBottleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  const { id } = await params

  return <BottleEditScreen user={admin} bottleId={id} />
}
