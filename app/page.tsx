"use client";
// app/page.tsx dosyasının en üstüne ekle:
import { createClient } from "@/lib/supabase";
import { useState, useEffect, useRef } from "react";
import MovieCard from "@/components/MovieCard";
import MovieDetailsModal from "@/components/MovieDetailsModal";
import WatchlistPanel from "@/components/WatchlistPanel";
import Image from "next/image";
import { Heart, X, Info, Languages, List, SlidersHorizontal, LogIn, Sparkles, RotateCcw } from "lucide-react";
import { Movie, fetchMovies, Language, FilterOptions, fetchMovieDetails } from "@/lib/api";
import { getWatchlist, addToWatchlist, removeFromWatchlist, clearWatchlist, getLikedGenres, getLanguagePreference, setLanguagePreference } from "@/lib/storage";
import { cloudGetWatchlist, cloudAddToWatchlist, cloudRemoveFromWatchlist, cloudClearWatchlist, cloudMarkWatched, cloudGetLanguage, cloudSetLanguage, migrateLocalToCloud } from "@/lib/storage.cloud";
import { useAuth } from "@/lib/auth-context";
import AuthModal from "@/components/AuthModal";
import ProfilePanel from "@/components/ProfilePanel";
import FilterBar from "@/components/FilterBar";
import EmptyState from "@/components/EmptyState";

export default function Home() {
  interface RecommendationItem {
    id: number;
  }

  const { user, loading: authLoading, signOut } = useAuth();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showWatchlistPanel, setShowWatchlistPanel] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [resettingLikes, setResettingLikes] = useState(false);

  const [isAiMode, setIsAiMode] = useState(false);
  const seenMovieIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    let active = true;
    setHasMounted(true);

    const initialize = async () => {
      const savedLanguage = getLanguagePreference();
      setLanguage(savedLanguage);

      setLoading(true);
      setIsAiMode(false);
      setNoResults(false);

      try {
        const genres = getLikedGenres();
        const initialMovies = await fetchMovies(genres, savedLanguage, {}, []);
        if (!active) return;

        if (initialMovies.length === 0) {
          setApiKeyMissing(true);
        }

        setMovies(initialMovies);
        setCurrentIndex(0);
      } catch (error) {
        console.error("Initial movie load error:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    void initialize();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      const localMovies = getWatchlist();
      migrateLocalToCloud(user.id, localMovies).then(() =>
        cloudGetWatchlist(user.id).then(setWatchlist)
      );
      cloudGetLanguage(user.id).then(lang => {
        if (lang) {
          setLanguage(lang as Language);
          setLanguagePreference(lang as Language);
        }
      });
    } else {
      setWatchlist(getWatchlist());
    }
  }, [user, authLoading]);

  const updateWatchlist = async () => {
    if (user) {
      const cloud = await cloudGetWatchlist(user.id);
      setWatchlist(cloud);
    } else {
      setWatchlist(getWatchlist());
    }
  };

  const resetLikedMovies = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from("movies")
      .update({ is_liked: false })
      .eq("is_liked", true);

    if (error) {
      console.error("Like reset error:", error.message);
      return false;
    }

    return true;
  };

  const handleResetLikes = async () => {
    const confirmMessage = language === "en"
      ? "Reset liked movie history?"
      : "Begeni gecmisini sifirlamak istiyor musun?";

    if (!window.confirm(confirmMessage)) return;

    setResettingLikes(true);
    try {
      const success = await resetLikedMovies();
      if (success) {
        setIsAiMode(false);
        setNoResults(false);
      }
    } finally {
      setResettingLikes(false);
    }
  };

  const loadMovies = async (
    lang?: Language,
    newFilters?: FilterOptions,
    mode: "replace" | "append" = "replace"
  ) => {
    setLoading(true);
    setIsAiMode(false);
    setNoResults(false);

    const genres = getLikedGenres();
    const currentLang = lang || language;
    const activeFilters = newFilters !== undefined ? newFilters : filters;
    const queuedIds = movies.map(m => m.id);
    const excludedIds = Array.from(new Set([...seenMovieIdsRef.current, ...queuedIds]));

    const newMovies = await fetchMovies(genres, currentLang, activeFilters, excludedIds);

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

    if (mode === "append") {
      setMovies(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const toAppend = newMovies.filter(m => !existingIds.has(m.id));
        return [...prev, ...toAppend];
      });
    } else {
      setMovies(newMovies);
      setCurrentIndex(0);
    }
    setLoading(false);
  };

 const loadAiRecommendations = async () => {
     if (!user) {
       setShowAuthModal(true);
       return;
     }

     if (isAiMode) {
       setIsAiMode(false);
       loadMovies(undefined, filters, "replace");
       return;
     }

     setLoading(true);
     setIsAiMode(true);
     setNoResults(false);

     try {
       const res = await fetch('/api/recommend', { method: 'POST' });
       const data = await res.json();

       if (data.recommendations && data.recommendations.length > 0) {
         // DÜZELTME: Sadece ID'yi alıp, filmin tüm afiş, yıl, tür detaylarını TMDB'den canlı çekiyoruz!
         const fullMovies = await Promise.all(
           (data.recommendations as RecommendationItem[]).map((rec) => fetchMovieDetails(rec.id, language))
         );

         // Boş dönenleri filtrele (filter(Boolean)) ve listeye aktar
         setMovies(fullMovies.filter(Boolean) as Movie[]);
         setCurrentIndex(0);
       } else {
         setNoResults(true);
       }
     } catch (err) {
       console.error("AI Hatası:", err);
       setNoResults(true);
     } finally {
       setLoading(false);
     }
   };


  const handleApplyFilters = (newFilters: FilterOptions) => {
    seenMovieIdsRef.current.clear();
    setFilters(newFilters);
    loadMovies(undefined, newFilters, "replace");
  };

  const handleSwipe = (direction: "left" | "right" | "up") => {
    if (currentIndex >= movies.length) return;

    if (direction === "up") {
      setSelectedMovie(movies[currentIndex]);
      return;
    }

    const movie = movies[currentIndex];
    seenMovieIdsRef.current.add(movie.id);

    // Kartı hemen ilerlet (UI Takılmaz)
    setCurrentIndex(prev => prev + 1);

    if (direction === "right") {
      // OPTIMISTIC UPDATE: Badge ve Listeyi anında güncelle
      setWatchlist(prev => {
        if (prev.some(m => m.id === movie.id)) return prev;
        return [movie, ...prev];
      });

      // Arka planda Vektör kaydı
      fetch('/api/embed', {
        method: 'POST',
        body: JSON.stringify({ movieId: movie.id }),
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => console.error("Vektör hatası:", err));

      // Arka planda Watchlist kaydı
      if (user) {
        cloudAddToWatchlist(movie.id, user.id)
          .then(() => cloudGetWatchlist(user.id))
          .then(setWatchlist) // Sunucudaki son haliyle senkronize et
          .catch(err => console.error("Cloud hatası:", err));
      } else {
        addToWatchlist(movie);
      }
    }

    if (currentIndex >= movies.length - 3 && !isAiMode) {
      loadMovies(undefined, undefined, "append");
    }
  };

  const handleRemoveFromWatchlist = async (movieId: number) => {
    if (user) {
      await cloudRemoveFromWatchlist(movieId, user.id);
    } else {
      removeFromWatchlist(movieId);
    }
    await updateWatchlist();
  };

  const handleClearWatchlist = async () => {
    if (user) {
      await cloudClearWatchlist(user.id);
    } else {
      clearWatchlist();
    }
    await updateWatchlist();
  };

  const handleToggleWatched = async (movieId: number, watched: boolean) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Optimistic UI update for quick feedback.
    setWatchlist(prev => prev.map(movie => (
      movie.id === movieId ? { ...movie, watched } : movie
    )));

    await cloudMarkWatched(movieId, user.id, watched);
    await updateWatchlist();
  };

  const handleLanguageChange = (newLang: Language) => {
    seenMovieIdsRef.current.clear();
    setLanguage(newLang);
    setLanguagePreference(newLang);
    if (user) cloudSetLanguage(user.id, newLang);
    setShowLanguageMenu(false);
    loadMovies(newLang, undefined, "replace");
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
            <Image src="/logo.png" alt="Movier" width={40} height={40} />
            <h1 className="text-4xl font-bold text-white">Movier</h1>
          </div>
          <h2 className="text-2xl font-semibold text-red-300 mb-4">TMDB API Key Gerekli</h2>
          <p className="text-gray-300 mb-4">
            Bu uygulamayı kullanmak için TMDB (The Movie Database) API key&apos;ine ihtiyacınız var.
          </p>
          <div className="bg-gray-900/50 rounded-2xl p-6 mb-4">
            <h3 className="text-xl font-semibold text-white mb-3">Nasıl Alınır?</h3>
            <ol className="list-decimal list-inside text-gray-300 space-y-2">
              <li>
                <a href="https://www.themoviedb.org/signup" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">
                  TMDB&apos;ye kaydolun
                </a>
              </li>
              <li>Hesap ayarlarından API bölümüne gidin</li>
              <li>API Key (v3 auth) alın</li>
              <li>
                <code className="bg-black/50 px-2 py-1 rounded text-sm">.env.local</code> dosyasındaki{" "}
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
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <h1 className="text-5xl font-bold text-white tracking-tight flex items-center gap-3">
              <Image src="/logo.png" alt="Movier" width={48} height={48} />
              <span className="text-red-600">Movier</span>
            </h1>
            <div className="flex gap-2">
              <button
                onClick={loadAiRecommendations}
                className={`p-2 rounded-lg border transition ${isAiMode ? "bg-purple-600 border-purple-500 text-white" : "bg-purple-600/20 hover:bg-purple-600/30 border-purple-600/50"}`}
                title={language === "en" ? "AI Recommendations" : "AI Önerisi"}
              >
                <Sparkles className="text-purple-300" size={20} />
              </button>

              <button
                onClick={handleResetLikes}
                disabled={resettingLikes}
                className="p-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/50 transition disabled:opacity-60"
                title={language === "en" ? "Reset liked history" : "Begeni gecmisini sifirla"}
              >
                <RotateCcw className={`text-amber-300 ${resettingLikes ? "animate-spin" : ""}`} size={20} />
              </button>

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

              {!authLoading && (
                user ? (
                  <button
                    onClick={() => setShowProfilePanel(true)}
                    className="p-2 rounded-lg bg-green-600/20 hover:bg-green-600/30 border border-green-600/50 transition"
                    title={user.email ?? "Profile"}
                  >
                    {user.user_metadata?.avatar_url ? (
                      <Image
                        src={String(user.user_metadata.avatar_url)}
                        alt="avatar"
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-green-400 text-xs font-bold w-5 h-5 flex items-center justify-center">
                        {(user.email ?? "U").slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/50 transition"
                    title={language === "en" ? "Sign in" : "Giriş yap"}
                  >
                    <LogIn className="text-blue-400" size={20} />
                  </button>
                )
              )}
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

        <FilterBar
          isOpen={showFilterBar}
          filters={filters}
          onApply={handleApplyFilters}
          language={language}
          onClose={() => setShowFilterBar(false)}
        />

        <div className="relative h-[600px] flex items-center justify-center mb-6">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">
                {isAiMode ? (language === "en" ? "AI is analyzing your taste..." : "AI zevkinizi analiz ediyor...") : (language === "en" ? "Loading movies..." : "Filmler yükleniyor...")}
              </p>
            </div>
          ) : noResults ? (
            <EmptyState
              type="no-results"
              language={language}
              onEditFilters={() => setShowFilterBar(true)}
              onClearFilters={() => {
                seenMovieIdsRef.current.clear();
                const empty: FilterOptions = {};
                setFilters(empty);
                loadMovies(undefined, empty, "replace");
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
              onLoadMore={() => loadMovies(undefined, undefined, "append")}
            />
          )}
        </div>

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
        onRemove={handleRemoveFromWatchlist}
        onToggleWatched={handleToggleWatched}
        canToggleWatched={!!user}
        onClearAll={handleClearWatchlist}
        language={language}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        language={language}
      />

      {user && (
        <ProfilePanel
          isOpen={showProfilePanel}
          onClose={() => setShowProfilePanel(false)}
          user={user}
          language={language}
          watchlistCount={watchlist.length}
          onSignOut={signOut}
        />
      )}
    </main>
  );
}