import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// İstemciyi (client) bir kez oluşturup saklamak için değişken tanımlıyoruz
let supabase: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  // Eğer daha önce bir istemci oluşturulmuşsa, yenisini yaratma; mevcut olanı döndür
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!url || !key) {
    console.error("Supabase URL veya Key eksik! .env.local dosyanızı kontrol edin.");
  }

  // Yeni istemciyi oluştur ve auth ayarlarını yapılandır
  supabase = createSupabaseClient(url, key, {
    auth: {
      persistSession: true, // Oturumu tarayıcıda sakla
      autoRefreshToken: true, // Token süresi dolunca otomatik yenile
      detectSessionInUrl: true // URL'deki (e-posta onayı gibi) oturumu algıla
    }
  });

  return supabase;
}