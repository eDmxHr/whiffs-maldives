import { redirect } from "next/navigation"

import { SettingsScreen } from "@/features/settings/components/settings-screen"
import { requireAdmin } from "@/lib/auth"

export default async function AdminSettingsPage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  return <SettingsScreen user={admin} />
}
