import { NextResponse } from 'next/server';
import { generateMovieEmbedding } from '@/lib/hf';
import { createClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { movieId } = await request.json();

    // 1. Supabase istemcisini BURADA bir kez tanımlıyoruz
    const supabase = createClient() as any ;

    const tmdbRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`);
    const movie = await tmdbRes.json();

    const genres = movie.genres?.map((g: any) => g.name).join(", ") || "";
    const textToEmbed = `Title: ${movie.title}. Genres: ${genres}. Description: ${movie.overview}`;
    const embedding = await generateMovieEmbedding(textToEmbed);

    // 2. Yukarıda tanımladığımız 'supabase' değişkenini burada kullanıyoruz
    const { error } = await supabase
      .from('movies')
      .upsert({
        id: movie.id,
        title: movie.title,
        overview: movie.overview || "",
        embedding: embedding,
        is_liked: true,
        poster_path: movie.poster_path, // Görseller için önemli
        vote_average: movie.vote_average
      }, {
        onConflict: 'id'
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Embed Hatası:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}