"use client";

import { useState, useEffect } from "react";
import MovieCard from "@/components/MovieCard";
import MovieDetailsModal from "@/components/MovieDetailsModal";
import { Heart, X, RotateCcw, Info, Trash2, Languages } from "lucide-react";
import { Movie, fetchMovies, Language } from "@/lib/api";
import { getLikedMovies, saveLikedMovie, getLikedGenres, clearLikedMovies, getLanguagePreference, setLanguagePreference } from "@/lib/storage";

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likedCount, setLikedCount] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [language, setLanguage] = useState<Language>("all");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    const savedLanguage = getLanguagePreference();
    setLanguage(savedLanguage);
    loadMovies(savedLanguage);
    setLikedCount(getLikedMovies().length);
  }, []);

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
      saveLikedMovie(movies[currentIndex]);
      setLikedCount(prev => prev + 1);
    }

    setCurrentIndex(prev => prev + 1);

    if (currentIndex >= movies.length - 3) {
      loadMovies();
    }
  };

  const handleReset = () => {
    clearLikedMovies();
    setLikedCount(0);
    setShowResetConfirm(false);
    loadMovies();
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setLanguagePreference(newLang);
    setShowLanguageMenu(false);
    loadMovies(newLang);
  };

  const languageLabels = {
    all: "🌍 Tüm Diller",
    tr: "🇹🇷 Türkçe",
    en: "🇬🇧 İngilizce"
  };

  const currentMovie = movies[currentIndex];

  if (apiKeyMissing) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-4">🎬 MovieMatch</h1>
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-5xl font-bold text-white">🎬 MovieMatch</h1>
            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 transition"
                  title="Dil Seçimi"
                >
                  <Languages className="text-red-400" size={20} />
                </button>
                {showLanguageMenu && (
                  <div className="absolute top-12 right-0 bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden shadow-2xl z-50 min-w-[180px]">
                    {(Object.keys(languageLabels) as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`w-full px-4 py-3 text-left hover:bg-red-500/20 transition ${
                          language === lang ? "bg-red-500/30 text-white" : "text-gray-300"
                        }`}
                      >
                        {languageLabels[lang]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {likedCount > 0 && (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 transition"
                  title="Beğenileri Sıfırla"
                >
                  <Trash2 className="text-red-400" size={20} />
                </button>
              )}
            </div>
          </div>
          <p className="text-red-300">Filmleri kaydırarak keşfet</p>
          <div className="mt-4 text-sm text-red-200">
            ❤️ {likedCount} film beğenildi • {languageLabels[language]}
          </div>
        </div>

        {showResetConfirm && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl backdrop-blur-sm">
            <p className="text-white text-center mb-3">
              Tüm beğenileri ve algoritma tercihlerini sıfırlamak istediğinize emin misiniz?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
              >
                Evet, Sıfırla
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        <div className="relative h-[650px] flex items-center justify-center">
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
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
              >
                <RotateCcw size={20} />
                Daha Fazla Yükle
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-6 mt-8">
          <button
            onClick={() => handleSwipe("left")}
            disabled={!currentMovie || loading}
            className="w-16 h-16 rounded-full bg-red-500/20 backdrop-blur-sm border-2 border-red-500 flex items-center justify-center hover:bg-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="text-red-500" size={32} />
          </button>
          <button
            onClick={() => handleSwipe("up")}
            disabled={!currentMovie || loading}
            className="w-16 h-16 rounded-full bg-blue-500/20 backdrop-blur-sm border-2 border-blue-500 flex items-center justify-center hover:bg-blue-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Info className="text-blue-500" size={32} />
          </button>
          <button
            onClick={() => handleSwipe("right")}
            disabled={!currentMovie || loading}
            className="w-16 h-16 rounded-full bg-green-500/20 backdrop-blur-sm border-2 border-green-500 flex items-center justify-center hover:bg-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart className="text-green-500" size={32} />
          </button>
        </div>

        <div className="text-center mt-6 text-red-300 text-sm">
          <p>👈 Beğenme | 👆 Detaylar | 👉 Beğen</p>
        </div>
      </div>

      <MovieDetailsModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </main>
  );
}
