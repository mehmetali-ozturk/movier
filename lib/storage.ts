import { Movie } from "./api";

const LIKED_MOVIES_KEY = "moviematch_liked_movies";
const LANGUAGE_KEY = "moviematch_language";

export function getLikedMovies(): Movie[] {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(LIKED_MOVIES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveLikedMovie(movie: Movie): void {
  if (typeof window === "undefined") return;
  
  const liked = getLikedMovies();
  const exists = liked.some(m => m.id === movie.id);
  
  if (!exists) {
    liked.push(movie);
    localStorage.setItem(LIKED_MOVIES_KEY, JSON.stringify(liked));
  }
}

export function clearLikedMovies(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(LIKED_MOVIES_KEY);
}

export function getLanguagePreference(): "all" | "tr" | "en" {
  if (typeof window === "undefined") return "all";
  
  const stored = localStorage.getItem(LANGUAGE_KEY);
  return (stored as "all" | "tr" | "en") || "all";
}

export function setLanguagePreference(language: "all" | "tr" | "en"): void {
  if (typeof window === "undefined") return;
  
  localStorage.setItem(LANGUAGE_KEY, language);
}

export function getLikedGenres(): number[] {
  const liked = getLikedMovies();
  const allGenres: string[] = [];
  
  liked.forEach(movie => {
    if (movie.genres) {
      allGenres.push(...movie.genres);
    }
  });
  
  // Tür isimlerini ID'lere çevir
  const genreMap: Record<string, number> = {
    "Aksiyon": 28,
    "Macera": 12,
    "Animasyon": 16,
    "Komedi": 35,
    "Suç": 80,
    "Drama": 18,
    "Fantastik": 14,
    "Korku": 27,
    "Romantik": 10749,
    "Bilim Kurgu": 878,
    "Gerilim": 53
  };
  
  const genreCount = allGenres.reduce((acc, genre) => {
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(genreCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([genre]) => genreMap[genre])
    .filter(Boolean);
}
