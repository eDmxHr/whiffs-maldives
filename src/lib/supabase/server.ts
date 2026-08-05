import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

import { appConfig, isSupabaseConfigured } from "@/lib/env"

export async function createClient() {
  if (!appConfig.supabaseUrl || !appConfig.supabaseAnonKey) {
    throw new Error("Supabase is not configured.")
  }

  const cookieStore = await cookies()

  return createServerClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server components cannot set cookies. Route handlers and actions can.
        }
      },
    },
  })
}

export async function getCurrentProfile() {
  if (!isSupabaseConfigured()) {
    return {
      id: "local-owner",
      name: "Whiffs Owner",
      role: "Owner",
      demoMode: true,
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data } = await supabase.from("profiles").select("id,name,avatar_url,is_active").eq("id", user.id).single()

  if (!data?.is_active) {
    return null
  }

  const { data: userRole } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle()

  const roleRecord = userRole?.roles as { name?: string } | { name?: string }[] | null
  const roleName = (Array.isArray(roleRecord) ? roleRecord[0]?.name : roleRecord?.name) ?? "Owner"

  return {
    id: data.id,
    name: data.name ?? user.email ?? "Owner",
    role: roleName,
    demoMode: false,
  }
}
