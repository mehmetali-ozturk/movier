import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface LikedMovieRow {
  id: number;
  embedding: number[] | string | null;
}

interface RecommendationRow {
  id: number;
  similarity?: number;
}

function parseEmbedding(value: number[] | string | null): number[] | null {
  if (!value) return null;
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as number[]) : null;
  } catch {
    return null;
  }
}

export async function POST() {
  try {
    const supabase = createClient();


    const { data: likedMovies, error: fetchError } = await supabase
      .from('movies')
      .select('id, embedding')
      .eq('is_liked', true);

    if (fetchError) throw fetchError;

    if (!likedMovies || likedMovies.length === 0) {
      return NextResponse.json({ error: "Like movies for recommendation." }, { status: 400 });
    }

    const typedLikedMovies = likedMovies as LikedMovieRow[];
    const likedIds = typedLikedMovies.map((movie) => movie.id);


    const avgVector = new Array(384).fill(0);

    typedLikedMovies.forEach((movie) => {
      const vectorArray = parseEmbedding(movie.embedding);


      if (vectorArray && Array.isArray(vectorArray)) {
        vectorArray.forEach((v: number, i: number) => {
          avgVector[i] += v / typedLikedMovies.length;
        });
      }
    });


    const { data: recommendations, error: matchError } = await supabase.rpc('match_movies', {
      query_embedding: avgVector,
      match_threshold: 0.3,
      match_count: 30
    });

    if (matchError) throw matchError;


    const recommendationRows = (recommendations ?? []) as RecommendationRow[];

    const filteredRecommendations = recommendationRows
      .filter((rec) => !likedIds.includes(rec.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    return NextResponse.json({ recommendations: filteredRecommendations });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Recommend API Hatası:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}