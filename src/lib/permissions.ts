export type PermissionKey =
  | "catalog.view"
  | "catalog.manage"
  | "orders.view"
  | "orders.create"
  | "orders.update"
  | "orders.cancel"
  | "orders.fulfill"
  | "payments.view"
  | "payments.verify"
  | "payments.refund"
  | "inventory.view"
  | "inventory.create"
  | "inventory.adjust"
  | "inventory.archive"
  | "customers.view"
  | "customers.manage"
  | "packaging.view"
  | "packaging.manage"
  | "expenses.view"
  | "expenses.manage"
  | "reports.view"
  | "settings.manage"
  | "users.manage"
  | "roles.manage"

export type RoleName = "Owner" | "Manager" | "Staff"

const ROLE_PERMISSIONS: Record<RoleName, PermissionKey[] | "all"> = {
  Owner: "all",
  Manager: [
    "catalog.view",
    "catalog.manage",
    "orders.view",
    "orders.create",
    "orders.update",
    "orders.fulfill",
    "payments.view",
    "payments.verify",
    "inventory.view",
    "inventory.create",
    "inventory.adjust",
    "customers.view",
    "customers.manage",
    "packaging.view",
    "packaging.manage",
    "reports.view",
  ],
  Staff: ["catalog.view", "orders.view", "orders.update", "orders.fulfill", "inventory.view", "customers.view", "packaging.view"],
}

export function hasPermission(role: string | undefined | null, key: PermissionKey): boolean {
  if (!role) {
    return false
  }

  const entry = ROLE_PERMISSIONS[role as RoleName]

  if (!entry) {
    return false
  }

  return entry === "all" || entry.includes(key)
}
