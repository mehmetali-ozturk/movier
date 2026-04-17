import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST() {
  try {
    const supabase = createClient()!;

    // 1. Beğenilen filmleri çekiyoruz
    const { data: likedMovies, error: fetchError } = await supabase
      .from('movies')
      .select('embedding')
      .eq('is_liked', true);

    console.log("Supabase'den dönen cevap:", likedMovies);
    console.log("Hata var mı?:", fetchError);

    if (fetchError) throw fetchError;
    if (fetchError) throw fetchError;

    if (!likedMovies || likedMovies.length === 0) {
      return NextResponse.json({ error: "You must like a movie for recommendations" }, { status: 400 });
    }

    // 2. Ortalama vektörü hesaplıyoruz
    const avgVector = new Array(384).fill(0);
    likedMovies.forEach((m: any) => {
      if (m.embedding && Array.isArray(m.embedding)) {
        m.embedding.forEach((v: number, i: number) => {
          avgVector[i] += v / likedMovies.length;
        });
      }
    });

    // 3. RPC fonksiyonunu çağırıyoruz (İŞTE BURADA matchError TANIMLANIYOR)
    const { data: recommendations, error: matchError } = await (supabase as any).rpc('match_movies', {
      query_embedding: avgVector,
      match_threshold: 0.3,
      match_count: 10
    });

    // 4. Hata kontrolü (Yukarıda tanımlandığı için artık kızmayacak)
    if (matchError) throw matchError;

    return NextResponse.json({ recommendations });
  } catch (error: any) {
    console.error("Recommend API Hatası:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}