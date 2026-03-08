"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Calendar, Trash2, ExternalLink, Film, Search, ArrowUpDown } from "lucide-react";
import { Movie, getImageUrl, Language, fetchMovieDetails } from "@/lib/api";
import { removeFromWatchlist, clearWatchlist } from "@/lib/storage";
import { useState, useEffect, useMemo } from "react";

interface WatchlistPanelProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: Movie[];
  onUpdate: () => void;
  language: Language;
}

export default function WatchlistPanel({ isOpen, onClose, watchlist, onUpdate, language }: WatchlistPanelProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [localizedMovies, setLocalizedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "rating" | "year" | "title">("default");
  const [activeGenreFilter, setActiveGenreFilter] = useState<string | null>(null);

  // Dil değiştiğinde watchlist'teki filmleri yeni dilde çek
  useEffect(() => {
    if (isOpen && watchlist.length > 0) {
      setLoading(true);
      Promise.all(
        watchlist.map(movie => fetchMovieDetails(movie.id, language))
      ).then(results => {
        const validMovies = results.filter((m): m is Movie => m !== null);
        setLocalizedMovies(validMovies);
        setLoading(false);
      });
    } else {
      setLocalizedMovies([]);
    }
  }, [isOpen, watchlist, language]);

  const displayMovies = localizedMovies.length > 0 ? localizedMovies : watchlist;

  const allGenres = useMemo(() => {
    const genreSet = new Set<string>();
    displayMovies.forEach(m => m.genres?.forEach(g => genreSet.add(g)));
    return Array.from(genreSet).sort();
  }, [displayMovies]);

  const filteredMovies = useMemo(() => {
    let result = [...displayMovies];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        m =>
          m.title?.toLowerCase().includes(q) ||
          m.originalTitle?.toLowerCase().includes(q)
      );
    }

    if (activeGenreFilter) {
      result = result.filter(m => m.genres?.includes(activeGenreFilter));
    }

    switch (sortBy) {
      case "rating":
        result.sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0));
        break;
      case "year":
        result.sort((a, b) => (b.releaseDate || "").localeCompare(a.releaseDate || ""));
        break;
      case "title":
        result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      default:
        break;
    }

    return result;
  }, [displayMovies, searchQuery, sortBy, activeGenreFilter]);

  const handleRemove = (movieId: number) => {
    removeFromWatchlist(movieId);
    onUpdate();
  };

  const handleClearAll = () => {
    clearWatchlist();
    onUpdate();
    setShowClearConfirm(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-black border-l border-red-600/30 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-red-600/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-white">{language==="en" ? "Watchlist":"İzleme Listem"}</h2>
                  <p className="text-gray-400 text-sm">{watchlist.length} {language === "en" ? "movies" : "film"}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <X className="text-white" size={24} />
                </button>
              </div>
              
              {/* Clear All Button */}
              {watchlist.length > 0 && (
                <>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition border border-red-600/30"
                  >
                    <Trash2 size={18} />
                      {language === "en"? "Clear All?": "Tüm Listeyi Temizle"}
                  </button>

                  {/* Search */}
                  <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={language === "en" ? "Search watchlist..." : "Listede ara..."}
                      className="w-full bg-white/5 border border-white/20 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-600/50"
                    />
                  </div>

                  {/* Sort Buttons */}
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 text-gray-400 text-xs mr-1">
                      <ArrowUpDown size={12} />
                      {language === "en" ? "Sort:" : "Sırala:"}
                    </span>
                    {([
                      { key: "default", en: "Added", tr: "Ekleme" },
                      { key: "rating", en: "Rating", tr: "Puan" },
                      { key: "year", en: "Year", tr: "Yıl" },
                      { key: "title", en: "A-Z", tr: "A-Z" },
                    ] as const).map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setSortBy(opt.key)}
                        className={`px-2.5 py-1 rounded-full text-xs transition border ${
                          sortBy === opt.key
                            ? "bg-red-600 border-red-500 text-white"
                            : "bg-white/5 border-white/20 text-gray-400 hover:text-white"
                        }`}
                      >
                        {language === "tr" ? opt.tr : opt.en}
                      </button>
                    ))}
                  </div>

                  {/* Genre Filter Pills */}
                  {allGenres.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <button
                        onClick={() => setActiveGenreFilter(null)}
                        className={`px-2.5 py-1 rounded-full text-xs transition border ${
                          activeGenreFilter === null
                            ? "bg-red-600 border-red-500 text-white"
                            : "bg-white/5 border-white/20 text-gray-400 hover:text-white"
                        }`}
                      >
                        {language === "en" ? "All" : "Hepsi"}
                      </button>
                      {allGenres.map(genre => (
                        <button
                          key={genre}
                          onClick={() => setActiveGenreFilter(activeGenreFilter === genre ? null : genre)}
                          className={`px-2.5 py-1 rounded-full text-xs transition border ${
                            activeGenreFilter === genre
                              ? "bg-red-600 border-red-500 text-white"
                              : "bg-white/5 border-white/20 text-gray-400 hover:text-white"
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Clear Confirmation */}
            {showClearConfirm && (
              <div className="mx-4 mt-4 p-4 bg-red-600/10 border border-red-600/30 rounded-xl">
                <p className="text-white text-center mb-3">
                    {language === "en" ? "Are you sure you want to clear your entire watchlist and algorithm preferences?" :
                        "Tüm izleme listesini ve algoritma tercihlerini temizlemek istediğinize emin misiniz?"}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleClearAll}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                      {language === "en" ? "Yes, Clear" : "Evet, Temizle"}
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                  >
                      {language === "en" ? "Cancel" : "İptal"}
                  </button>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              {watchlist.length === 0 ? (
                <div className="text-center py-12">
                  <Film className="mx-auto text-gray-600 mb-4" size={64} strokeWidth={1.5} />
                  <p className="text-gray-400 text-lg mb-2">{language === "en" ? "Your watchlist is empty" : "İzleme listeniz boş"}</p>
                  <p className="text-gray-500 text-sm">
                      {language === "en" ? "Swipe right on movies you like to add them" :
                          "Beğendiğiniz filmleri sağa kaydırarak ekleyin"}
                  </p>
                </div>
              ) : loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">{language === "en" ? "Loading..." : "Yükleniyor..."}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMovies.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">
                      {language === "en" ? "No movies match your search." : "Arama kriterlerine uyan film bulunamadı."}
                    </p>
                  ) : (
                  filteredMovies.map((movie) => (
                    <motion.div
                      key={movie.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-red-600/30 transition group"
                    >
                      <div className="flex gap-4 p-3">
                        {/* Poster */}
                        {movie.posterPath && (
                          <img
                            src={getImageUrl(movie.posterPath, "w185")}
                            alt={movie.title}
                            className="w-24 h-36 object-cover rounded-lg"
                          />
                        )}
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-lg line-clamp-2 mb-1">
                            {movie.title}
                          </h3>
                          
                          <div className="flex items-center gap-2 mb-2">
                            {movie.voteAverage && (
                              <div className="flex items-center gap-1">
                                <Star className="text-yellow-400 fill-yellow-400" size={14} />
                                <span className="text-white text-sm font-semibold">
                                  {movie.voteAverage.toFixed(1)}
                                </span>
                              </div>
                            )}
                            {movie.releaseDate && (
                              <div className="flex items-center gap-1 text-gray-400 text-sm">
                                <Calendar size={14} />
                                <span>{new Date(movie.releaseDate).getFullYear()}</span>
                              </div>
                            )}
                          </div>
                          
                          {movie.genres && movie.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {movie.genres.slice(0, 2).map((genre, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-white/10 text-gray-300 rounded text-xs"
                                >
                                  {genre}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRemove(movie.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition"
                            >
                              <Trash2 size={14} />
                                {language === "en" ? "Remove" : "Kaldır"}
                            </button>
                            <a
                              href={`https://www.themoviedb.org/movie/${movie.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm transition"
                            >
                              <ExternalLink size={14} />
                              TMDB
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
