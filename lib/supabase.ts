import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!url || !key) {
    console.error("Supabase URL veya Key eksik! .env.local dosyanızı kontrol edin.");
  }

  return createSupabaseClient(url, key)
}