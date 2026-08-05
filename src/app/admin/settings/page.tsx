import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/common/access-denied"
import { SettingsScreen } from "@/features/settings/components/settings-screen"
import { requireAdmin } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

export default async function AdminSettingsPage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  if (!hasPermission(admin.role, "settings.manage")) {
    return <AccessDenied user={admin} title="Settings" />
  }

  return <SettingsScreen user={admin} />
}
