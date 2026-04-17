import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

export type Database = {
  public: {
    Tables: {
      movies: {
        Row: { id: number; title: string; overview: string | null; embedding: number[] | null; is_liked: boolean; poster_path?: string | null; vote_average?: number | null }
        Insert: { id: number; title: string; overview?: string | null; embedding?: number[] | null; is_liked?: boolean; poster_path?: string | null; vote_average?: number | null }
        Update: { id?: number; title?: string; overview?: string | null; embedding?: number[] | null; is_liked?: boolean; poster_path?: string | null; vote_average?: number | null }
      }
    }
  }
}

// 'ReturnType' yerine doğrudan 'SupabaseClient<Database>' kullanıyoruz
let supabase: SupabaseClient<Database> | null = null;

export function createClient() {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  supabase = createSupabaseClient<Database>(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });

  return supabase;
}