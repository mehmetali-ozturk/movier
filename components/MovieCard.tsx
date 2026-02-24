"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { Movie, getImageUrl } from "@/lib/api";
import { Star } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  onSwipe: (direction: "left" | "right" | "up") => void;
}

export default function MovieCard({ movie, onSwipe }: MovieCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(
    [x, y],
    ([latestX, latestY]) => {
      const xAbs = Math.abs(latestX as number);
      const yAbs = Math.abs(latestY as number);
      if (xAbs > 100 || yAbs > 100) return 0;
      return 1;
    }
  );

  const handleDragEnd = () => {
    const threshold = 100;
    const currentX = x.get();
    const currentY = y.get();

    if (currentY < -threshold) {
      onSwipe("up");
    } else if (Math.abs(currentX) > threshold) {
      onSwipe(currentX > 0 ? "right" : "left");
    }
  };

  return (
    <motion.div
      className="absolute w-full max-w-sm cursor-grab active:cursor-grabbing"
      style={{ x, y, rotate, opacity }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.95 }}
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl border border-white/20">
        <div className="relative h-[500px] bg-gradient-to-br from-red-500/20 to-orange-500/20">
          {movie.posterPath ? (
            <img
              src={getImageUrl(movie.posterPath, "w500")}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-6xl">
              🎬
            </div>
          )}
          
          {/* Rating Badge */}
          {movie.voteAverage && (
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-1">
              <Star className="text-yellow-400 fill-yellow-400" size={16} />
              <span className="text-white font-semibold">{movie.voteAverage.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">
            {movie.title}
          </h2>
          {movie.releaseDate && (
            <p className="text-red-300 mb-3">
              {new Date(movie.releaseDate).getFullYear()}
            </p>
          )}
          {movie.overview && (
            <p className="text-gray-300 text-sm line-clamp-3 mb-4">
              {movie.overview}
            </p>
          )}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movie.genres.slice(0, 3).map((genre, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-red-500/30 text-red-200 rounded-full text-xs"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
