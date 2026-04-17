import { NextResponse } from 'next/server';
import { generateMovieEmbedding } from '@/lib/hf';
import { createClient } from '@/lib/supabase';

const GENRE_MAP: { [key: number]: string } = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

export async function GET() {
  const supabase = createClient();
  const TMDB_KEY = process.env.TMDB_API_KEY;

  try {
    for (let page = 1; page <= 10; page++) { // Fetch 10 pages for 200 movies
      const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&page=${page}`);
      const data = await res.json();

      for (const movie of data.results) {
        const genreNames = movie.genre_ids?.map((id: number) => GENRE_MAP[id]).join(", ") || "";
        const textToEmbed = `Title: ${movie.title}. Genres: ${genreNames}. Description: ${movie.overview}`;

        const embedding = await generateMovieEmbedding(textToEmbed);

        await supabase.from('movies').upsert({
          id: movie.id, title: movie.title, overview: movie.overview,
          embedding: embedding, is_liked: false // Save as a candidate movie
        });
      }
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}