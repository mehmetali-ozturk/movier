import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = createClient();
    const { data: likedMovies } = await supabase.from('movies').select('embedding').eq('is_liked', true);

    if (!likedMovies || likedMovies.length === 0) {
      return NextResponse.json({ error: "You must like a movie for recommendations" }, { status: 400 });
    }

    const avgVector = new Array(384).fill(0);
    likedMovies.forEach(m => m.embedding.forEach((v: number, i: number) => avgVector[i] += v / likedMovies.length));

    const { data: recommendations, error: matchError } = await supabase.rpc('match_movies', {
      query_embedding: avgVector,
      match_threshold: 0.65, //
      match_count: 10
    });

    if (matchError) throw matchError;
    return NextResponse.json({ recommendations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}