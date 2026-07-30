import type { IconSvgElement } from "@hugeicons/react"
import { DashboardSquare01Icon, Invoice03Icon, MilkBottleIcon, PerfumeIcon, UserGroup02Icon } from "@hugeicons/core-free-icons"

export type AdminNavItem = {
  label: string
  href: string
  icon: IconSvgElement
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: DashboardSquare01Icon },
  { label: "Orders", href: "/admin/orders", icon: Invoice03Icon },
  { label: "Fragrances", href: "/admin/fragrances", icon: PerfumeIcon },
  { label: "Bottles", href: "/admin/bottles", icon: MilkBottleIcon },
  { label: "Customers", href: "/admin/customers", icon: UserGroup02Icon },
]
