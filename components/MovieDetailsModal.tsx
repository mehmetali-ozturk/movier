"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Calendar } from "lucide-react";
import { Movie, getImageUrl } from "@/lib/api";

interface MovieDetailsModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export default function MovieDetailsModal({ movie, onClose }: MovieDetailsModalProps) {
  if (!movie) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          className="bg-gradient-to-br from-red-900/90 to-gray-900/90 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-gradient-to-b from-red-900/95 to-transparent backdrop-blur-sm p-4 flex justify-between items-center border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">Film Detayları</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="text-white" size={24} />
            </button>
          </div>

          {/* Backdrop Image */}
          {movie.backdropPath && (
            <div className="relative h-64 overflow-hidden">
              <img
                src={getImageUrl(movie.backdropPath, "w1280")}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 to-transparent" />
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {movie.posterPath && (
                <img
                  src={getImageUrl(movie.posterPath, "w342")}
                  alt={movie.title}
                  className="w-full md:w-48 rounded-2xl shadow-lg"
                />
              )}

              <div className="flex-1">
                <h3 className="text-3xl font-bold text-white mb-3">{movie.title}</h3>
                
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <p className="text-xl text-red-300 mb-3 italic">
                    {movie.originalTitle}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 mb-4">
                  {movie.voteAverage && (
                    <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full">
                      <Star className="text-yellow-400 fill-yellow-400" size={20} />
                      <span className="text-white font-semibold text-lg">
                        {movie.voteAverage.toFixed(1)}
                      </span>
                      {movie.voteCount && (
                        <span className="text-gray-300 text-sm">
                          ({movie.voteCount.toLocaleString()})
                        </span>
                      )}
                    </div>
                  )}
                  
                  {movie.releaseDate && (
                    <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full">
                      <Calendar className="text-red-400" size={20} />
                      <span className="text-white font-semibold">
                        {new Date(movie.releaseDate).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {movie.genres.map((genre, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-red-500/30 text-red-200 rounded-full text-sm font-medium"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {movie.overview && (
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-xl font-semibold text-white mb-3">Özet</h4>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {movie.overview}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
