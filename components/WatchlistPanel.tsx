"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Calendar, Trash2, ExternalLink, Film } from "lucide-react";
import { Movie, getImageUrl, Language, fetchMovieDetails } from "@/lib/api";
import { removeFromWatchlist, clearWatchlist } from "@/lib/storage";
import { useState, useEffect } from "react";

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
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition border border-red-600/30"
                >
                  <Trash2 size={18} />
                    {language === "en"? "Clear All?": "Tüm Listeyi Temizle"}
                </button>
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
                  {displayMovies.map((movie) => (
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
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
