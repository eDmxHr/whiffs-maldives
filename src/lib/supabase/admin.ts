import { createClient } from "@supabase/supabase-js"

import { appConfig } from "@/lib/env"

// Service-role client -- bypasses RLS entirely. Only ever instantiate this inside a route that
// has already gated the request with requireAdmin() + hasPermission(admin.role, "users.manage"),
// and never export it for general data access.
export function createAdminClient() {
  if (!appConfig.supabaseUrl || !appConfig.supabaseServiceRoleKey) {
    throw new Error("Supabase service role key is not configured.")
  }

  return createClient(appConfig.supabaseUrl, appConfig.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
