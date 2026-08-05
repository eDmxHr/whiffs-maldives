import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/common/access-denied"
import { ReportsScreen } from "@/features/reports/components/reports-screen"
import { requireAdmin } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

export default async function AdminReportsPage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  if (!hasPermission(admin.role, "reports.view")) {
    return <AccessDenied user={admin} title="Reports" />
  }

  return <ReportsScreen user={admin} />
}
