import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/common/access-denied"
import { OrderDetailScreen } from "@/features/orders/components/order-detail-screen"
import { requireAdmin } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const admin = await requireAdmin()

  if (!admin) {
    redirect("/admin/sign-in")
  }

  if (!hasPermission(admin.role, "orders.view")) {
    return <AccessDenied user={admin} title="Orders" />
  }

  const { id } = await params

  return <OrderDetailScreen user={admin} orderId={id} />
}
