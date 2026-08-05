import type { RoleName } from "@/lib/permissions"

export interface AdminUser {
  id: string
  name: string
  role: RoleName
}
