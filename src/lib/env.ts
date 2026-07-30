const gstRate = Number(process.env.NEXT_PUBLIC_GST_RATE ?? "0.08")
const targetGrossMargin = Number(process.env.NEXT_PUBLIC_TARGET_GROSS_MARGIN ?? "0.4")
const priceRoundingIncrement = Number(process.env.NEXT_PUBLIC_PRICE_ROUNDING_INCREMENT ?? "5")

export const appConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "fragrance-images",
  gstRate: Number.isFinite(gstRate) ? gstRate : 0.08,
  targetGrossMargin: Number.isFinite(targetGrossMargin) ? targetGrossMargin : 0.4,
  priceRoundingIncrement: Number.isFinite(priceRoundingIncrement) ? priceRoundingIncrement : 5,
}

export function isSupabaseConfigured() {
  return Boolean(appConfig.supabaseUrl && appConfig.supabaseAnonKey)
}
