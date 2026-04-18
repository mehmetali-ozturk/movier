import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = createClient()!;


    const { data: likedMovies, error: fetchError } = await supabase
      .from('movies')
      .select('id, embedding')
      .eq('is_liked', true);

    if (fetchError) throw fetchError;

    if (!likedMovies || likedMovies.length === 0) {
      return NextResponse.json({ error: "Like movies for recommendation." }, { status: 400 });
    }

    const likedIds = likedMovies.map((m: any) => m.id);


    const avgVector = new Array(384).fill(0);

    likedMovies.forEach((m: any) => {
      let vectorArray = m.embedding;


      if (typeof m.embedding === 'string') {
        try {
          vectorArray = JSON.parse(m.embedding);
        } catch (e) {
          console.error("Vektör dönüştürme hatası:", e);
        }
      }


      if (vectorArray && Array.isArray(vectorArray)) {
        vectorArray.forEach((v: number, i: number) => {
          avgVector[i] += v / likedMovies.length;
        });
      }
    });


    const { data: recommendations, error: matchError } = await (supabase as any).rpc('match_movies', {
      query_embedding: avgVector,
      match_threshold: 0.3,
      match_count: 30
    });

    if (matchError) throw matchError;


    const filteredRecommendations = recommendations
      .filter((rec: any) => !likedIds.includes(rec.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    return NextResponse.json({ recommendations: filteredRecommendations });
  } catch (error: any) {
    console.error("Recommend API Hatası:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}