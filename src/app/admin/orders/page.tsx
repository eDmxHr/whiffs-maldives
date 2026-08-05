import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/common/access-denied"
import { OrdersScreen } from "@/features/orders/components/orders-screen"
import { requireAdmin } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

export default async function AdminOrdersPage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  if (!hasPermission(admin.role, "orders.view")) {
    return <AccessDenied user={admin} title="Orders" />
  }

  return <OrdersScreen user={admin} />
}
