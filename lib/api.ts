export interface Movie {
  id: number;
  title: string;
  originalTitle?: string;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: string;
  voteAverage?: number;
  voteCount?: number;
  genres?: string[];
  language?: string;
}

export type Language = "all" | "tr" | "en";

const TMDB_API_KEY = "YOUR_TMDB_API_KEY"; // Kullanıcı kendi API key'ini ekleyecek
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// Popüler film kategorileri ve arama terimleri
const POPULAR_GENRES: Record<Language, number[]> = {
  all: [28, 12, 16, 35, 80, 18, 14, 27, 10749, 878, 53, 10752], // Tüm türler
  en: [28, 12, 35, 80, 18, 14, 27, 10749, 878, 53], // Aksiyon, Macera, Komedi, vb.
  tr: [18, 35, 10749, 80, 53] // Drama, Komedi, Romantik, Suç, Gerilim
};

// Genre ID'leri
const GENRE_MAP: Record<number, string> = {
  28: "Aksiyon",
  12: "Macera",
  16: "Animasyon",
  35: "Komedi",
  80: "Suç",
  99: "Belgesel",
  18: "Drama",
  10751: "Aile",
  14: "Fantastik",
  36: "Tarih",
  27: "Korku",
  10402: "Müzik",
  9648: "Gizem",
  10749: "Romantik",
  878: "Bilim Kurgu",
  10770: "TV Film",
  53: "Gerilim",
  10752: "Savaş",
  37: "Western"
};

export function getImageUrl(path: string, size: string = "w500"): string {
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export async function fetchMovies(
  preferredGenres: number[] = [],
  language: Language = "all"
): Promise<Movie[]> {
  const allMovies: Movie[] = [];
  
  // %90 rastgele popüler filmler, %10 beğenilen türler
  const usePreferredGenre = preferredGenres.length > 0 && Math.random() < 0.1;
  
  // Dil parametresi
  const langParam = language === "all" ? "" : language;
  
  try {
    // Popüler filmler
    const popularResponse = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=${langParam || "en"}&page=${Math.floor(Math.random() * 5) + 1}`
    );
    
    if (popularResponse.ok) {
      const data = await popularResponse.json();
      allMovies.push(...processMovies(data.results));
      console.log(`Popular movies: ${data.results.length}`);
    }
    
    // Top rated filmler
    const topRatedResponse = await fetch(
      `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=${langParam || "en"}&page=${Math.floor(Math.random() * 5) + 1}`
    );
    
    if (topRatedResponse.ok) {
      const data = await topRatedResponse.json();
      allMovies.push(...processMovies(data.results));
      console.log(`Top rated movies: ${data.results.length}`);
    }
    
    // Beğenilen türlerden filmler
    if (usePreferredGenre && preferredGenres.length > 0) {
      const genreId = preferredGenres[Math.floor(Math.random() * preferredGenres.length)];
      const genreResponse = await fetch(
        `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=${langParam || "en"}&with_genres=${genreId}&sort_by=popularity.desc&page=${Math.floor(Math.random() * 3) + 1}`
      );
      
      if (genreResponse.ok) {
        const data = await genreResponse.json();
        allMovies.push(...processMovies(data.results));
        console.log(`Genre ${GENRE_MAP[genreId]} movies: ${data.results.length}`);
      }
    }
    
    // Tekrar edenleri kaldır
    const uniqueMovies = Array.from(
      new Map(allMovies.map(movie => [movie.id, movie])).values()
    );
    
    console.log(`Total unique movies: ${uniqueMovies.length}`);
    
    // Karıştır ve döndür
    return uniqueMovies
      .sort(() => Math.random() - 0.5)
      .slice(0, 40);
      
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
}

function processMovies(items: any[]): Movie[] {
  return items
    .filter((item: any) => {
      // Poster ve açıklama olmalı
      return item.poster_path && item.overview && item.vote_count > 10;
    })
    .map((item: any) => ({
      id: item.id,
      title: item.title,
      originalTitle: item.original_title,
      overview: item.overview,
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      releaseDate: item.release_date,
      voteAverage: item.vote_average,
      voteCount: item.vote_count,
      genres: item.genre_ids?.map((id: number) => GENRE_MAP[id]).filter(Boolean),
      language: item.original_language,
    }));
}

export { GENRE_MAP };
