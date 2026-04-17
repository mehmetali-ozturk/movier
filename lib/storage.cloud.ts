/**
 * Cloud storage layer — wraps Supabase.
 * Only movie_id is persisted; details are always fetched from TMDB.
 */

import { createClient } from "@/lib/supabase";
import { Movie } from "@/lib/api";

/**
 * Returns stub Movie objects — each has only `id` set.
 * WatchlistPanel fetches full details from TMDB via fetchMovieDetails.
 */
export async function cloudGetWatchlist(userId: string): Promise<Movie[]> {
  const supabase = createClient() as any; // Type Bypass eklendi
  const { data, error } = await supabase
    .from("watchlist")
    .select("movie_id")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row: any) => ({ id: row.movie_id, title: "" }));
}

export async function cloudAddToWatchlist(movieId: number, userId: string): Promise<void> {
  const supabase = createClient() as any;
  await supabase
    .from("watchlist")
    .upsert({ user_id: userId, movie_id: movieId }, { onConflict: "user_id,movie_id" });
}

export async function cloudRemoveFromWatchlist(movieId: number, userId: string): Promise<void> {
  const supabase = createClient() as any;
  await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", userId)
    .eq("movie_id", movieId);
}

export async function cloudClearWatchlist(userId: string): Promise<void> {
  const supabase = createClient() as any;
  await supabase.from("watchlist").delete().eq("user_id", userId);
}

export async function cloudMarkWatched(movieId: number, userId: string, watched: boolean): Promise<void> {
  const supabase = createClient() as any;
  await supabase
    .from("watchlist")
    .update({ watched })
    .eq("user_id", userId)
    .eq("movie_id", movieId);
}

export async function cloudGetLanguage(userId: string): Promise<string | null> {
  const supabase = createClient() as any;
  const { data } = await supabase
    .from("user_preferences")
    .select("language")
    .eq("user_id", userId)
    .single();
  return data?.language ?? null;
}

export async function cloudSetLanguage(userId: string, language: string): Promise<void> {
  const supabase = createClient() as any;
  await supabase
    .from("user_preferences")
    .upsert({ user_id: userId, language, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
}

/**
     Migrate localStorage watchlist to Supabase on first login.
    Only persists movie_ids — details are fetched from TMDB on demand.
    works perfect :)
   */
export async function migrateLocalToCloud(userId: string, localMovies: Movie[]): Promise<void> {
  if (localMovies.length === 0) return;
  const supabase = createClient() as any;
  const rows = localMovies.map(m => ({ user_id: userId, movie_id: m.id }));
  await supabase.from("watchlist").upsert(rows, { onConflict: "user_id,movie_id" });
}


export async function cloudUploadAvatar(userId: string, file: File): Promise<string | null> {
  const supabase = createClient() as any;
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) return null;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  // Cache-bust so the browser picks up the new image immediately
  const url = `${data.publicUrl}?t=${Date.now()}`;


  await supabase
    .from("user_preferences")
    .upsert(
      { user_id: userId, avatar_url: url, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  return url;
}


export async function cloudGetAvatarUrl(userId: string): Promise<string | null> {
  const supabase = createClient() as any;
  const { data } = await supabase
    .from("user_preferences")
    .select("avatar_url")
    .eq("user_id", userId)
    .single();
  return data?.avatar_url ?? null;
}