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

export type Language = "tr" | "en" | "es" | "fr" | "de" | "it" | "ja" | "ko";

export interface FilterOptions {
  genreIds?: number[];
  minRating?: number;
  yearFrom?: number;
  yearTo?: number;
  minVoteCount?: number;
}

const TMDB_API_KEY = "a541270bca92f769670f0479054f3a07";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// Genre ID'leri - Türkçe
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
  language: Language = "en",
  filters: FilterOptions = {}
): Promise<Movie[]> {
  const hasFilters =
    (filters.genreIds && filters.genreIds.length > 0) ||
    !!filters.minRating ||
    !!filters.yearFrom ||
    !!filters.yearTo;

  if (hasFilters) {
    return fetchFilteredMovies(language, filters);
  }

  const allMovies: Movie[] = [];
  
  // %90 rastgele popüler filmler, %10 beğenilen türler
  const usePreferredGenre = preferredGenres.length > 0 && Math.random() < 0.1;
  
  try {
    // Popüler filmler (seçilen dilde)
    const popularResponse = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=${language}&page=${Math.floor(Math.random() * 5) + 1}`
    );
    
    if (popularResponse.ok) {
      const data = await popularResponse.json();
      allMovies.push(...processMovies(data.results));
      console.log(`Popular movies (${language}): ${data.results.length}`);
    }
    
    // Top rated filmler (seçilen dilde)
    const topRatedResponse = await fetch(
      `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=${language}&page=${Math.floor(Math.random() * 5) + 1}`
    );
    
    if (topRatedResponse.ok) {
      const data = await topRatedResponse.json();
      allMovies.push(...processMovies(data.results));
      console.log(`Top rated movies (${language}): ${data.results.length}`);
    }
    
    // Beğenilen türlerden filmler
    if (usePreferredGenre && preferredGenres.length > 0) {
      const genreId = preferredGenres[Math.floor(Math.random() * preferredGenres.length)];
      const genreResponse = await fetch(
        `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=${language}&with_genres=${genreId}&sort_by=popularity.desc&page=${Math.floor(Math.random() * 3) + 1}`
      );
      
      if (genreResponse.ok) {
        const data = await genreResponse.json();
        allMovies.push(...processMovies(data.results));
        console.log(`Genre ${GENRE_MAP[genreId]} movies (${language}): ${data.results.length}`);
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

async function fetchFilteredMovies(language: Language, filters: FilterOptions): Promise<Movie[]> {
  const allMovies: Movie[] = [];

  try {
    const pageOffsets = [Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 1];

    const responses = await Promise.all(
      pageOffsets.map(page => {
        const params = new URLSearchParams({
          api_key: TMDB_API_KEY,
          language,
          sort_by: "popularity.desc",
          include_adult: "false",
          "vote_count.gte": String(filters.minVoteCount ?? 30),
          page: String(page),
        });

        if (filters.genreIds && filters.genreIds.length > 0) {
          params.set("with_genres", filters.genreIds.join(","));
        }
        if (filters.minRating) {
          params.set("vote_average.gte", String(filters.minRating));
        }
        if (filters.yearFrom) {
          params.set("primary_release_date.gte", `${filters.yearFrom}-01-01`);
        }
        if (filters.yearTo) {
          params.set("primary_release_date.lte", `${filters.yearTo}-12-31`);
        }

        return fetch(`${TMDB_BASE_URL}/discover/movie?${params}`);
      })
    );

    for (const response of responses) {
      if (response.ok) {
        const data = await response.json();
        allMovies.push(...processMovies(data.results));
      }
    }

    const uniqueMovies = Array.from(
      new Map(allMovies.map(movie => [movie.id, movie])).values()
    );

    return uniqueMovies.sort(() => Math.random() - 0.5).slice(0, 40);
  } catch (error) {
    console.error("Error fetching filtered movies:", error);
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
      title: item.title || item.original_title, // Fallback to original
      originalTitle: item.original_title,
      overview: item.overview || `${item.title || item.original_title}`, // Fallback
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      releaseDate: item.release_date,
      voteAverage: item.vote_average,
      voteCount: item.vote_count,
      genres: item.genre_ids?.map((id: number) => GENRE_MAP[id]).filter(Boolean),
      language: item.original_language,
      runtime: item.runtime,
    }));
}

export async function fetchMovieDetails(movieId: number, language: Language = "en"): Promise<Movie | null> {
  try {
    // Önce seçilen dilde dene
    let response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=${language}`
    );
    
    if (!response.ok) return null;
    
    let data = await response.json();
    
    // Eğer açıklama yoksa İngilizce'den al (fallback)
    if (!data.overview && language !== "en") {
      console.log(`No overview in ${language}, falling back to English`);
      const fallbackResponse = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en`
      );
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        data.overview = fallbackData.overview || data.overview;
        data.title = data.title || fallbackData.title;
      }
    }
    
    return {
      id: data.id,
      title: data.title || data.original_title,
      originalTitle: data.original_title,
      overview: data.overview || `${data.title || data.original_title}`,
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

export async function fetchMovieTrailer(movieId: number): Promise<string | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
    );
    if (!response.ok) return null;

    const data = await response.json();

    const trailer = data.results.find(
      (v: any) => v.site === "YouTube" && v.type === "Trailer"
    ) || data.results.find(
      (v: any) => v.site === "YouTube"
    );

    return trailer ? trailer.key : null;
  } catch (error) {
    console.error("Error fetching trailer:", error);
    return null;
  }
}

export { GENRE_MAP };
