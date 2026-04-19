import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

export type Database = {
  public: {
    Tables: {
      movies: {
        Row: {
          id: number;
          title: string;
          overview: string | null;
          embedding: number[] | null;
          is_liked: boolean;
          poster_path: string | null;
          vote_average: number | null;
        };
        Insert: {
          id: number;
          title: string;
          overview?: string | null;
          embedding?: number[] | null;
          is_liked?: boolean;
          poster_path?: string | null;
          vote_average?: number | null;
        };
        Update: {
          id?: number;
          title?: string;
          overview?: string | null;
          embedding?: number[] | null;
          is_liked?: boolean;
          poster_path?: string | null;
          vote_average?: number | null;
        };
      };
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          movie_id: number;
          watched: boolean;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          movie_id: number;
          watched?: boolean;
          added_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          movie_id?: number;
          watched?: boolean;
          added_at?: string;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          language: string;
          updated_at: string;
          avatar_url: string | null;
        };
        Insert: {
          user_id: string;
          language?: string;
          updated_at?: string;
          avatar_url?: string | null;
        };
        Update: {
          user_id?: string;
          language?: string;
          updated_at?: string;
          avatar_url?: string | null;
        };
      };
    };
    Functions: {
      match_movies: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
        };
        Returns: {
          id: number;
          similarity: number;
        }[];
      };
    };
  };
};

const chainHandler: ProxyHandler<object> = {
  get: (_target, prop) => {
    if (prop === "then") {
      return (resolve: (value: { data: []; error: null }) => void) =>
        resolve({ data: [], error: null });
    }
    return () => new Proxy({}, chainHandler);
  },
};

function createMockClient(): SupabaseClient {
  return new Proxy({} as SupabaseClient, {
    get(_target, prop) {
      if (prop === "auth") {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signOut: async () => ({ error: null }),
          signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
          signUp: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
          signInWithOAuth: async () => ({ data: { provider: "google", url: null }, error: { message: "Supabase not configured" } }),
        };
      }

      if (prop === "storage") {
        return {
          from: () => ({
            upload: async () => ({ data: null, error: null }),
            getPublicUrl: () => ({ data: { publicUrl: "" } }),
          }),
        };
      }

      if (prop === "rpc") {
        return async () => ({ data: [], error: null });
      }

      if (prop === "from") {
        return () => new Proxy({}, chainHandler);
      }

      return () => new Proxy({}, chainHandler);
    },
  });
}

let warnedMissingEnv = false;
let browserClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!url || !key) {
    if (!warnedMissingEnv && process.env.NODE_ENV !== "production") {
      warnedMissingEnv = true;
      console.warn("Supabase env missing. Falling back to a mock client.");
    }
    return createMockClient();
  }

  if (typeof window !== "undefined") {
    if (!browserClient) {
      browserClient = createSupabaseClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
    return browserClient;
  }

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}