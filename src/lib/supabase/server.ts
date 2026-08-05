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

  const { data } = await supabase.rpc("get_my_context")
  const context = data?.[0]

  if (!context || !context.is_active || !context.role_name) {
    return null
  }

  return {
    id: context.id,
    name: context.name ?? user.email ?? "Owner",
    role: context.role_name,
    demoMode: false,
  }
}
