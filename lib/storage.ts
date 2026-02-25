import { Movie, Language } from "./api";

const WATCHLIST_KEY = "movier_watchlist";
const LANGUAGE_KEY = "movier_language";

export function getWatchlist(): Movie[] {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(WATCHLIST_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addToWatchlist(movie: Movie): void {
  if (typeof window === "undefined") return;
  
  const watchlist = getWatchlist();
  const exists = watchlist.some(m => m.id === movie.id);
  
  if (!exists) {
    watchlist.unshift(movie); // En başa ekle
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }
}

export function removeFromWatchlist(movieId: number): void {
  if (typeof window === "undefined") return;
  
  const watchlist = getWatchlist();
  const filtered = watchlist.filter(m => m.id !== movieId);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
}

export function clearWatchlist(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(WATCHLIST_KEY);
}

export function getLanguagePreference(): Language {
  if (typeof window === "undefined") return "en";
  
  const stored = localStorage.getItem(LANGUAGE_KEY);
  return (stored as Language) || "en";
}

export function setLanguagePreference(language: Language): void {
  if (typeof window === "undefined") return;
  
  localStorage.setItem(LANGUAGE_KEY, language);
}

export function getLikedGenres(): number[] {
  const watchlist = getWatchlist();
  const allGenres: string[] = [];
  
  watchlist.forEach(movie => {
    if (movie.genres) {
      allGenres.push(...movie.genres);
    }
  });
  
  // Tür isimlerini ID'lere çevir
    const genreMap: Record<string, number> = {
        "Aksiyon": 28, "Action": 28,
        "Macera": 12, "Adventure": 12,
        "Animasyon": 16, "Animation": 16,
        "Komedi": 35, "Comedy": 35,
        "Suç": 80, "Crime": 80,
        "Drama": 18,
        "Fantastik": 14, "Fantasy": 14,
        "Korku": 27, "Horror": 27,
        "Romantik": 10749, "Romance": 10749,
        "Bilim Kurgu": 878, "Science Fiction": 878,
        "Gerilim": 53, "Thriller": 53
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
