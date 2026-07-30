import { redirect } from "next/navigation"

import { OrdersScreen } from "@/features/orders/components/orders-screen"
import { requireAdmin } from "@/lib/auth"

export default async function AdminOrdersPage() {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  return <OrdersScreen user={admin} />
}
