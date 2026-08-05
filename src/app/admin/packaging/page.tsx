import { redirect } from "next/navigation"

import { PackagingListScreen } from "@/features/packaging/components/packaging-list-screen"
import { requireAdmin } from "@/lib/auth"

export default async function AdminPackagingPage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  return <PackagingListScreen user={admin} />
}
