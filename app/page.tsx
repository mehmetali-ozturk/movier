"use client";

import { useState, useEffect } from "react";
import MovieCard from "@/components/MovieCard";
import MovieDetailsModal from "@/components/MovieDetailsModal";
import WatchlistPanel from "@/components/WatchlistPanel";
import { Heart, X, RotateCcw, Info, Languages, List, Film } from "lucide-react";
import { Movie, fetchMovies, Language } from "@/lib/api";
import { getWatchlist, addToWatchlist, getLikedGenres, clearWatchlist, getLanguagePreference, setLanguagePreference } from "@/lib/storage";

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [language, setLanguage] = useState<Language>("all");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showWatchlistPanel, setShowWatchlistPanel] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

    useEffect(() => {
        setHasMounted(true); //
        const savedLanguage = getLanguagePreference();
        setLanguage(savedLanguage);
        loadMovies(savedLanguage);
        updateWatchlist();
    }, []);

  const updateWatchlist = () => {
    setWatchlist(getWatchlist());
  };

  const loadMovies = async (lang?: Language) => {
    setLoading(true);
    const genres = getLikedGenres();
    const currentLang = lang || language;
    const newMovies = await fetchMovies(genres, currentLang);
    
    if (newMovies.length === 0) {
      setApiKeyMissing(true);
    }
    
    setMovies(newMovies);
    setCurrentIndex(0);
    setLoading(false);
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

// ui için dil değişiklikleri
    const languageLabels = {
        all: language === "en" ? "All Languages" : "Tüm Diller",
        tr: language === "en" ? "Turkish" : "Türkçe",
        en: language === "en" ? "English" : "İngilizce"
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
              <button
                onClick={() => setShowWatchlistPanel(true)}
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
                        className={`w-full px-4 py-3 text-left hover:bg-red-600/20 transition ${
                          language === lang ? "bg-red-600/30 text-white" : "text-gray-300"
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

        {/* Movie Card Area */}
        <div className="relative h-[600px] flex items-center justify-center mb-6">
          {loading ? (
            <div className="text-white text-xl">Filmler yükleniyor...</div>
          ) : currentMovie ? (
            <MovieCard
              movie={currentMovie}
              onSwipe={handleSwipe}
            />
          ) : (
            <div className="text-center">
              <p className="text-white text-xl mb-4">Daha fazla film yok!</p>
              <button
                onClick={() => loadMovies()}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                <RotateCcw size={20} />
                Daha Fazla Yükle
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
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
        Language={language}
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
