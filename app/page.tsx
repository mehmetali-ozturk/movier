"use client";

import { useState, useEffect } from "react";
import MovieCard from "@/components/MovieCard";
import MovieDetailsModal from "@/components/MovieDetailsModal";
import WatchlistPanel from "@/components/WatchlistPanel";
import { Heart, X, Info, Languages, List, Film, SlidersHorizontal } from "lucide-react";
import { Movie, fetchMovies, Language, FilterOptions } from "@/lib/api";
import { getWatchlist, addToWatchlist, getLikedGenres, getLanguagePreference, setLanguagePreference } from "@/lib/storage";
import FilterBar from "@/components/FilterBar";
import EmptyState from "@/components/EmptyState";

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showWatchlistPanel, setShowWatchlistPanel] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const savedLanguage = getLanguagePreference();
    setLanguage(savedLanguage);
    loadMovies(savedLanguage);
    updateWatchlist();
  }, []);

  const updateWatchlist = () => {
    setWatchlist(getWatchlist());
  };

  const loadMovies = async (lang?: Language, newFilters?: FilterOptions) => {
    setLoading(true);
    setNoResults(false);
    const genres = getLikedGenres();
    const currentLang = lang || language;
    const activeFilters = newFilters !== undefined ? newFilters : filters;
    const newMovies = await fetchMovies(genres, currentLang, activeFilters);

    const hasActiveFilters = Object.values(activeFilters).some(v =>
      Array.isArray(v) ? v.length > 0 : v !== undefined
    );

    if (newMovies.length === 0) {
      if (hasActiveFilters) {
        setNoResults(true);
      } else {
        setApiKeyMissing(true);
      }
    }

    setMovies(newMovies);
    setCurrentIndex(0);
    setLoading(false);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    loadMovies(undefined, newFilters);
  };

  const handleSwipe = (direction: "left" | "right" | "up") => {
    if (currentIndex >= movies.length) return;

    if (direction === "up") {
      setSelectedMovie(movies[currentIndex]);
      return;
    }

    if (direction === "right") {
      addToWatchlist(movies[currentIndex]);
      updateWatchlist();
    }

    setCurrentIndex(prev => prev + 1);

    if (currentIndex >= movies.length - 3) {
      loadMovies();
    }
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setLanguagePreference(newLang);
    setShowLanguageMenu(false);
    loadMovies(newLang);
  };

  const languageLabels: Record<Language, string> = {
    tr: "🇹🇷 Türkçe",
    en: "🇬🇧 English",
    es: "🇪🇸 Español",
    fr: "🇫🇷 Français",
    de: "🇩🇪 Deutsch",
    it: "🇮🇹 Italiano",
    ja: "🇯🇵 日本語",
    ko: "🇰🇷 한국어"
  };

  const currentMovie = movies[currentIndex];

  if (apiKeyMissing) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <Film className="text-red-600" size={40} />
            <h1 className="text-4xl font-bold text-white">Movier</h1>
          </div>
          <h2 className="text-2xl font-semibold text-red-300 mb-4">TMDB API Key Gerekli</h2>
          <p className="text-gray-300 mb-4">
            Bu uygulamayı kullanmak için TMDB (The Movie Database) API key'ine ihtiyacınız var.
          </p>
          <div className="bg-gray-900/50 rounded-2xl p-6 mb-4">
            <h3 className="text-xl font-semibold text-white mb-3">Nasıl Alınır?</h3>
            <ol className="list-decimal list-inside text-gray-300 space-y-2">
              <li>
                <a href="https://www.themoviedb.org/signup" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">
                  TMDB'ye kaydolun
                </a>
              </li>
              <li>Hesap ayarlarından API bölümüne gidin</li>
              <li>API Key (v3 auth) alın</li>
              <li>
                <code className="bg-black/50 px-2 py-1 rounded text-sm">lib/api.ts</code> dosyasındaki{" "}
                <code className="bg-black/50 px-2 py-1 rounded text-sm">TMDB_API_KEY</code> değişkenine yapıştırın
              </li>
            </ol>
          </div>
          <p className="text-sm text-gray-400">
            TMDB API ücretsizdir ve günde 1000 istek hakkı verir.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <h1 className="text-5xl font-bold text-white tracking-tight flex items-center gap-3">
              <Film className="text-red-600" size={48} />
              <span className="text-red-600">Movier</span>
            </h1>
            <div className="flex gap-2">
              <button onClick={() => setShowFilterBar(prev => !prev)}
                className={`relative p-2 rounded-lg border transition ${Object.values(filters).some(v => (Array.isArray(v) ? v.length > 0 : v !== undefined))
                    ? "bg-red-600 border-red-500 text-white"
                    : "bg-red-600/20 hover:bg-red-600/30 border-red-600/50"
                  }`}
                title={language === "en" ? "Filters" : "Filtreler"}
              >
                <SlidersHorizontal className="text-red-200" size={20} />
                {Object.values(filters).some(v => (Array.isArray(v) ? v.length > 0 : v !== undefined)) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-black text-xs rounded-full flex items-center justify-center font-bold">
                    ✓
                  </span>
                )}
              </button>
              <button onClick={() => setShowWatchlistPanel(true)}
                className="relative p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 transition"
                title={language === "en" ? "My Watchlist" : "İzleme Listem"}
              >
                <List className="text-red-500" size={20} />
                {hasMounted && watchlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {watchlist.length}
                  </span>
                )}
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 transition"
                  title={language === "en" ? "Language Selection" : "Dil Seçimi"}
                >
                  <Languages className="text-red-500" size={20} />
                </button>
                {showLanguageMenu && (
                  <div className="absolute top-12 right-0 bg-black/95 backdrop-blur-lg border border-red-600/30 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[180px]">
                    {(Object.keys(languageLabels) as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`w-full px-4 py-3 text-left hover:bg-red-600/20 transition ${language === lang ? "bg-red-600/30 text-white" : "text-gray-300"
                          }`}
                      >
                        {languageLabels[lang]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-2">
            {language === "en" ? "Swipe to discover movies" : "Filmleri kaydırarak keşfet"}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 border border-red-600/30 rounded-full">
            <Heart className="text-red-500" size={16} fill="currentColor" />
            <span className="text-white font-medium">{hasMounted ? watchlist.length : 0}</span>
            <span className="text-gray-400 text-sm">• {languageLabels[language]}</span>
          </div>
        </div>

        {/* Filter Modal */}
        <FilterBar
          isOpen={showFilterBar}
          filters={filters}
          onApply={handleApplyFilters}
          language={language}
          onClose={() => setShowFilterBar(false)}
        />

        {/* Movie Card Area */}
        <div className="relative h-[600px] flex items-center justify-center mb-6">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">
                {language === "en" ? "Loading movies..." : "Filmler yükleniyor..."}
              </p>
            </div>
          ) : noResults ? (
            <EmptyState
              type="no-results"
              language={language}
              onEditFilters={() => setShowFilterBar(true)}
              onClearFilters={() => {
                const empty: FilterOptions = {};
                setFilters(empty);
                loadMovies(undefined, empty);
              }}
            />
          ) : currentMovie ? (
            <MovieCard
              key={currentMovie.id}
              movie={currentMovie}
              nextMovie={movies[currentIndex + 1]}
              onSwipe={handleSwipe}
              language={language}
            />
          ) : (
            <EmptyState
              type="all-seen"
              language={language}
              onLoadMore={() => loadMovies()}
            />
          )}
        </div>

        {/* Action Buttons  */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => handleSwipe("left")}
            disabled={!currentMovie || loading}
            className="w-16 h-16 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center hover:bg-gray-700 hover:border-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <X className="text-gray-300" size={28} />
          </button>
          <button
            onClick={() => handleSwipe("up")}
            disabled={!currentMovie || loading}
            className="w-16 h-16 rounded-full bg-blue-600 border-2 border-blue-500 flex items-center justify-center hover:bg-blue-700 hover:border-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Info className="text-white" size={28} />
          </button>
          <button
            onClick={() => handleSwipe("right")}
            disabled={!currentMovie || loading}
            className="w-16 h-16 rounded-full bg-red-600 border-2 border-red-500 flex items-center justify-center hover:bg-red-700 hover:border-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Heart className="text-white" size={28} />
          </button>
        </div>
      </div>

      <MovieDetailsModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        language={language}
      />

      <WatchlistPanel
        isOpen={showWatchlistPanel}
        onClose={() => setShowWatchlistPanel(false)}
        watchlist={watchlist}
        onUpdate={updateWatchlist}
        language={language}
      />
    </main>
  );
}
