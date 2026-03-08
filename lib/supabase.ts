import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const chainHandler: ProxyHandler<object> = {
  get: () => () => new Proxy({} as object, chainHandler),
};

function makeMockClient(): SupabaseClient {
  return new Proxy({} as SupabaseClient, {
    get(_target, prop) {
      if (prop === "auth") {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signOut: async () => ({ error: null }),
          signInWithPassword: async () => ({ data: {}, error: { message: "Supabase not configured" } }),
          signUp: async () => ({ data: {}, error: { message: "Supabase not configured" } }),
          signInWithOAuth: async () => ({ data: {}, error: { message: "Supabase not configured" } }),
        };
      }
      return () => new Proxy({} as object, chainHandler);
    },
  });
}

let _client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!url.startsWith("http")) return makeMockClient();

  if (!_client) {
    _client = createBrowserClient(url, key);
  }
  return _client;
}


