"use client"

import { createBrowserClient } from "@supabase/ssr"

import { appConfig } from "@/lib/env"

export function createClient() {
  if (!appConfig.supabaseUrl || !appConfig.supabaseAnonKey) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.")
  }

  return createBrowserClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey)
}
