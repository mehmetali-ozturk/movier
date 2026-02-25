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
  runtime?: number;
}

export type Language = "all" | "tr" | "en";

const TMDB_API_KEY = "a541270bca92f769670f0479054f3a07"; // Kullanıcı kendi API key'ini ekleyecek
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// Popüler film kategorileri ve arama terimleri
const POPULAR_GENRES: Record<Language, number[]> = {
  all: [28, 12, 16, 35, 80, 18, 14, 27, 10749, 878, 53, 10752], // Tüm türler
  en: [28, 12, 35, 80, 18, 14, 27, 10749, 878, 53], // Aksiyon, Macera, Komedi, vb.
  tr: [18, 35, 10749, 80, 53] // Drama, Komedi, Romantik, Suç, Gerilim
};

// Genre ID'leri
const GENRES = {
    tr: {
        28: "Aksiyon", 12: "Macera", 16: "Animasyon", 35: "Komedi", 80: "Suç", 99: "Belgesel", 18: "Drama", 10751: "Aile", 14: "Fantastik", 36: "Tarih", 27: "Korku", 10402: "Müzik", 9648: "Gizem", 10749: "Romantik", 878: "Bilim Kurgu", 10770: "TV Film", 53: "Gerilim", 10752: "Savaş", 37: "Western"
    },
    en: {
        28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
    }
};

export const GENRE_MAP = GENRES.tr; // Uyumluluk için

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
      allMovies.push(...processMovies(data.results,language));
      console.log(`Popular movies: ${data.results.length}`);
    }
    
    // Top rated filmler
    const topRatedResponse = await fetch(
      `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=${langParam || "en"}&page=${Math.floor(Math.random() * 5) + 1}`
    );
    
    if (topRatedResponse.ok) {
      const data = await topRatedResponse.json();
      allMovies.push(...processMovies(data.results,language));
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
        allMovies.push(...processMovies(data.results,language));
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

function processMovies(items: any[], language: Language): Movie[] {
    const langKey = language === "tr" ? "tr" : "en"; // Varsayılan dilleri değiştirdim

    return items
        .filter((item: any) => {
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
      genres: item.genre_ids?.map((id: number) => GENRES[langKey][id as keyof typeof GENRES['tr']]).filter(Boolean),
      language: item.original_language,
      runtime: item.runtime,
    }));
}

export async function fetchMovieDetails(movieId: number, language: Language = "en"): Promise<Movie | null> {
    const langParam = language === "tr" ? "tr" : "en";
    try {
        const response = await fetch(
            // language=tr vardı onun yerine dinamik şekilde halletsin diye parametre olarak aldım
            `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=${langParam}`
        );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      id: data.id,
      title: data.title,
      originalTitle: data.original_title,
      overview: data.overview,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      releaseDate: data.release_date,
      voteAverage: data.vote_average,
      voteCount: data.vote_count,
      genres: data.genres?.map((g: any) => g.name),
      language: data.original_language,
      runtime: data.runtime,
    };
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}

export { GENRE_MAP };
