import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/common/access-denied"
import { UsersScreen } from "@/features/users/components/users-screen"
import { requireAdmin } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

export default async function AdminUsersPage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  if (!hasPermission(admin.role, "users.manage")) {
    return <AccessDenied user={admin} title="Users" />
  }

  return <UsersScreen user={admin} />
}
