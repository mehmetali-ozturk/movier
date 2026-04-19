import { NextResponse } from 'next/server';
import { generateMovieEmbedding } from '@/lib/hf';
import { createClient } from '@/lib/supabase';

interface EmbedRequestBody {
  movieId?: number;
}

interface TmdbGenre {
  name: string;
}

interface TmdbMovieDetails {
  id: number;
  title: string;
  overview?: string | null;
  poster_path?: string | null;
  vote_average?: number | null;
  genres?: TmdbGenre[];
}

export async function POST(request: Request) {
  try {
    const { movieId } = (await request.json()) as EmbedRequestBody;

    if (!movieId || typeof movieId !== 'number') {
      return NextResponse.json({ error: 'Valid movieId is required.' }, { status: 400 });
    }


    const supabase = createClient();

    const tmdbRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`);
    if (!tmdbRes.ok) {
      throw new Error(`TMDB request failed with status ${tmdbRes.status}`);
    }

    const movie = (await tmdbRes.json()) as TmdbMovieDetails;

    const genres = movie.genres?.map((g) => g.name).join(", ") || "";
    const textToEmbed = `Title: ${movie.title}. Genres: ${genres}. Description: ${movie.overview}`;
    const embedding = await generateMovieEmbedding(textToEmbed);

    // Supabase used again
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Embed Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}