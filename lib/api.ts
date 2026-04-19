import { createClient } from "@/lib/supabase";


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

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

interface TmdbListMovie {
  id: number;
  title?: string;
  original_title?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  original_language?: string;
  runtime?: number;
}

interface TmdbGenre {
  name: string;
}

interface TmdbMovieDetailsResponse {
  id: number;
  title?: string;
  original_title?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  genres?: TmdbGenre[];
  original_language?: string;
  runtime?: number;
}

interface TmdbListResponse {
  results: TmdbListMovie[];
}

interface TmdbVideo {
  site?: string;
  type?: string;
  key?: string;
}

interface TmdbVideosResponse {
  results?: TmdbVideo[];
}

// Route all TMDB calls through our server-side proxy (/api/tmdb)
// so the API key is never exposed in the browser bundle.
function tmdb(path: string, params: Record<string, string> = {}): Promise<Response> {
  const qs = new URLSearchParams({ path, ...params });
  return fetch(`/api/tmdb?${qs}`);
}

// In-memory cache keyed by "movieId-language". Lives for the tab session.
const movieDetailsCache = new Map<string, Movie>();

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
  language: Language = "en",
  filters: FilterOptions = {},
  excludedMovieIds: number[] = []
): Promise<Movie[]> {
  const hasFilters =
    (filters.genreIds && filters.genreIds.length > 0) ||
    !!filters.minRating ||
    !!filters.yearFrom ||
    !!filters.yearTo;

  if (hasFilters) {
    return fetchFilteredMovies(language, filters, excludedMovieIds);
  }

  const allMovies: Movie[] = [];
  
  const excludedSet = new Set(excludedMovieIds);

  // %90 rastgele popüler filmler, %10 beğenilen türler
  const usePreferredGenre = preferredGenres.length > 0 && Math.random() < 0.1;

  const randomPage = (max: number = 20) => String(Math.floor(Math.random() * max) + 1);
  
  try {

    const popularResponse = await tmdb("/movie/popular", {
      language,
      page: randomPage(),
    });
    
    if (popularResponse.ok) {
      const data = (await popularResponse.json()) as TmdbListResponse;
      allMovies.push(...processMovies(data.results));
      console.log(`Popular movies (${language}): ${data.results.length}`);
    }
    

    const topRatedResponse = await tmdb("/movie/top_rated", {
      language,
      page: randomPage(),
    });
    
    if (topRatedResponse.ok) {
      const data = (await topRatedResponse.json()) as TmdbListResponse;
      allMovies.push(...processMovies(data.results));
      console.log(`Top rated movies (${language}): ${data.results.length}`);
    }
    
    // Liked genres
    if (usePreferredGenre && preferredGenres.length > 0) {
      const genreId = preferredGenres[Math.floor(Math.random() * preferredGenres.length)];
      const genreResponse = await tmdb("/discover/movie", {
        language,
        with_genres: String(genreId),
        sort_by: "popularity.desc",
        page: randomPage(15),
      });
      
      if (genreResponse.ok) {
        const data = (await genreResponse.json()) as TmdbListResponse;
        allMovies.push(...processMovies(data.results));
        console.log(`Genre ${GENRE_MAP[genreId]} movies (${language}): ${data.results.length}`);
      }
    }
    
    // Remove duplicate films
    const uniqueMovies = Array.from(
      new Map(allMovies.map(movie => [movie.id, movie])).values()
    ).filter(movie => !excludedSet.has(movie.id));
    
    console.log(`Total unique movies: ${uniqueMovies.length}`);
    
    // Shuffle
    return uniqueMovies
      .sort(() => Math.random() - 0.5)
      .slice(0, 40);
      
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
}

async function fetchFilteredMovies(
  language: Language,
  filters: FilterOptions,
  excludedMovieIds: number[] = []
): Promise<Movie[]> {
  const allMovies: Movie[] = [];
  const excludedSet = new Set(excludedMovieIds);

  try {
    const pageOffsets = [
      Math.floor(Math.random() * 20) + 1,
      Math.floor(Math.random() * 20) + 1,
      Math.floor(Math.random() * 20) + 1,
    ];

    const responses = await Promise.all(
      pageOffsets.map(page => {
        const params: Record<string, string> = {
          language,
          sort_by: "popularity.desc",
          include_adult: "false",
          "vote_count.gte": String(filters.minVoteCount ?? 30),
          page: String(page),
        };
        if (filters.genreIds && filters.genreIds.length > 0) {
          params["with_genres"] = filters.genreIds.join(",");
        }
        if (filters.minRating) params["vote_average.gte"] = String(filters.minRating);
        if (filters.yearFrom) params["primary_release_date.gte"] = `${filters.yearFrom}-01-01`;
        if (filters.yearTo) params["primary_release_date.lte"] = `${filters.yearTo}-12-31`;
        return tmdb("/discover/movie", params);
      })
    );

    for (const response of responses) {
      if (response.ok) {
        const data = (await response.json()) as TmdbListResponse;
        allMovies.push(...processMovies(data.results));
      }
    }

    const uniqueMovies = Array.from(
      new Map(allMovies.map(movie => [movie.id, movie])).values()
    ).filter(movie => !excludedSet.has(movie.id));

    return uniqueMovies.sort(() => Math.random() - 0.5).slice(0, 40);
  } catch (error) {
    console.error("Error fetching filtered movies:", error);
    return [];
  }
}

function processMovies(items: TmdbListMovie[]): Movie[] {
  return items
    .filter((item) => {
      // Poster ve açıklama olmalı
      return item.poster_path && item.overview && (item.vote_count ?? 0) > 10;
    })
    .map((item) => ({
      id: item.id,
      title: item.title || item.original_title || "Unknown Title", // Fallback to original
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
  const cacheKey = `${movieId}-${language}`;
  if (movieDetailsCache.has(cacheKey)) return movieDetailsCache.get(cacheKey)!;

  try {
    const response = await tmdb(`/movie/${movieId}`, { language });
    
    if (!response.ok) return null;
    
    const data = (await response.json()) as TmdbMovieDetailsResponse;
    let mergedData = data;
    
    // no explanation = use english language as default (fallback)
    if (!mergedData.overview && language !== "en") {
      console.log(`No overview in ${language}, falling back to English`);
      const fallbackResponse = await tmdb(`/movie/${movieId}`, { language: "en" });
      
      if (fallbackResponse.ok) {
        const fallbackData = (await fallbackResponse.json()) as TmdbMovieDetailsResponse;
        mergedData = {
          ...mergedData,
          overview: fallbackData.overview || mergedData.overview,
          title: mergedData.title || fallbackData.title,
        };
      }
    }
    
    const movie: Movie = {
      id: mergedData.id,
      title: mergedData.title || mergedData.original_title || "Unknown Title",
      originalTitle: mergedData.original_title,
      overview: mergedData.overview || `${mergedData.title || mergedData.original_title}`,
      posterPath: mergedData.poster_path,
      backdropPath: mergedData.backdrop_path,
      releaseDate: mergedData.release_date,
      voteAverage: mergedData.vote_average,
      voteCount: mergedData.vote_count,
      genres: mergedData.genres?.map((genre) => genre.name),
      language: mergedData.original_language,
      runtime: mergedData.runtime,
    };
    movieDetailsCache.set(cacheKey, movie);
    return movie;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}

export async function fetchMovieTrailer(movieId: number): Promise<string | null> {
  try {
    const response = await tmdb(`/movie/${movieId}/videos`, { language: "en-US" });
    if (!response.ok) return null;

    const data = (await response.json()) as TmdbVideosResponse;
    const videos = data.results ?? [];

    const trailer = videos.find(
      (video) => video.site === "YouTube" && video.type === "Trailer"
    ) || videos.find(
      (video) => video.site === "YouTube"
    );

    return trailer?.key ?? null;
  } catch (error) {
    console.error("Error fetching trailer:", error);
    return null;
  }
}

// Vector Function
export async function fetchVectorRecommendations(
  userVector: number[],
  language: Language
): Promise<Movie[]> {
  const supabase = createClient(); // Supabase client runs

  type MatchMovieRow = { id: number };

  // Fetching Supabase ıd's
  const { data: matchedMovies, error } = await supabase.rpc('match_movies', {
    query_embedding: userVector,
    match_threshold: 0.3, // max %70 similarity
    match_count: 10
  });

  if (error || !matchedMovies) {
    console.error("Vector do not match:", error);
    return [];
  }

 //  fetch details of matched ID in users preffered language
  const typedMatches = (matchedMovies ?? []) as MatchMovieRow[];
  const recommendedMovies = await Promise.all(
    typedMatches.map((movie) => fetchMovieDetails(movie.id, language))
  );

  return recommendedMovies.filter(Boolean) as Movie[];
}

export { GENRE_MAP };
