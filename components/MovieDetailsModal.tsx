"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Calendar, Clock, Film } from "lucide-react";
import { Movie, getImageUrl, fetchMovieDetails } from "@/lib/api";
import { useEffect, useState } from "react";

interface MovieDetailsModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export default function MovieDetailsModal({ movie, onClose }: MovieDetailsModalProps) {
  const [detailedMovie, setDetailedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (movie) {
      setLoading(true);
      fetchMovieDetails(movie.id).then((details) => {
        if (details) {
          setDetailedMovie(details);
        } else {
          setDetailedMovie(movie);
        }
        setLoading(false);
      });
    }
  }, [movie]);

  if (!movie) return null;

  const displayMovie = detailedMovie || movie;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          className="bg-black/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-red-600/30 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Backdrop Image */}
          {displayMovie.backdropPath && (
            <div className="relative h-64 overflow-hidden">
              <img
                src={getImageUrl(displayMovie.backdropPath, "w1280")}
                alt={displayMovie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center transition border border-white/20"
              >
                <X className="text-white" size={24} />
              </button>
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {displayMovie.posterPath && (
                <img
                  src={getImageUrl(displayMovie.posterPath, "w342")}
                  alt={displayMovie.title}
                  className="w-full md:w-48 rounded-xl shadow-lg"
                />
              )}

              <div className="flex-1">
                <h3 className="text-3xl font-bold text-white mb-2">{displayMovie.title}</h3>
                
                {displayMovie.originalTitle && displayMovie.originalTitle !== displayMovie.title && (
                  <p className="text-xl text-gray-400 mb-4 italic">
                    {displayMovie.originalTitle}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 mb-4">
                  {displayMovie.voteAverage && (
                    <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg border border-yellow-500/30">
                      <Star className="text-yellow-400 fill-yellow-400" size={20} />
                      <span className="text-white font-bold text-lg">
                        {displayMovie.voteAverage.toFixed(1)}
                      </span>
                      {displayMovie.voteCount && (
                        <span className="text-gray-400 text-sm">
                          ({displayMovie.voteCount.toLocaleString()})
                        </span>
                      )}
                    </div>
                  )}
                  
                  {displayMovie.releaseDate && (
                    <div className="flex items-center gap-2 bg-red-600/20 px-4 py-2 rounded-lg border border-red-600/30">
                      <Calendar className="text-red-500" size={20} />
                      <span className="text-white font-semibold">
                        {new Date(displayMovie.releaseDate).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  {displayMovie.runtime && (
                    <div className="flex items-center gap-2 bg-blue-600/20 px-4 py-2 rounded-lg border border-blue-600/30">
                      <Clock className="text-blue-500" size={20} />
                      <span className="text-white font-semibold">
                        {Math.floor(displayMovie.runtime / 60)}s {displayMovie.runtime % 60}dk
                      </span>
                    </div>
                  )}
                </div>

                {displayMovie.genres && displayMovie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {displayMovie.genres.map((genre, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-white/10 text-gray-300 rounded-lg text-sm font-medium border border-white/20"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {displayMovie.overview && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h4 className="text-xl font-semibold text-white mb-3">Özet</h4>
                <p className="text-gray-300 leading-relaxed">
                  {displayMovie.overview}
                </p>
              </div>
            )}

            {loading && (
              <div className="text-center text-gray-400 text-sm mt-4">
                Detaylar yükleniyor...
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
