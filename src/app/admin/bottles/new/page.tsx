import { redirect } from "next/navigation"

import { BottleCreateScreen } from "@/features/inventory/components/bottle-create-screen"
import { requireAdmin } from "@/lib/auth"

export default async function AdminNewBottlePage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  return <BottleCreateScreen user={admin} />
}
