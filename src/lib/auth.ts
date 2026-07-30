import { getCurrentProfile } from "@/lib/supabase/server"

export async function requireAdmin() {
  const profile = await getCurrentProfile()

  if (!profile) {
    return null
  }

  return profile
}
