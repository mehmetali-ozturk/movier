"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { Movie, getImageUrl, Language} from "@/lib/api";
import { Star, Calendar, Heart, X, Film } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  onSwipe: (direction: "left" | "right" | "up") => void;
  language : Language
}

export default function MovieCard({ movie, onSwipe, language }: MovieCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotate = useTransform(x, [-200, 0, 200], [-30, 0, 30]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  // Like/Nope overlay opacity
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 100;
    
    if (info.offset.y < -threshold) {
      onSwipe("up");
    } else if (info.offset.x > threshold) {
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      onSwipe("left");
    }
  };

  return (
    <motion.div
      className="absolute w-full max-w-sm cursor-grab active:cursor-grabbing"
      style={{ x, y, rotate, opacity }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      whileTap={{ scale: 0.97, cursor: "grabbing" }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
    >
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        {/* Like Overlay */}
        <motion.div 
          style={{ opacity: likeOpacity }}
          className="absolute top-8 left-8 z-10 bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-2xl border-4 border-green-400 rotate-[-20deg] shadow-lg"
        >
          <Heart className="inline mr-2" size={28} fill="currentColor" />
          LIKE
        </motion.div>
        
        {/* Nope Overlay */}
        <motion.div 
          style={{ opacity: nopeOpacity }}
          className="absolute top-8 right-8 z-10 bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-2xl border-4 border-red-400 rotate-[20deg] shadow-lg"
        >
          <X className="inline mr-2" size={28} />
          NOPE
        </motion.div>

        {/* Poster Image */}
        <div className="relative h-[600px] bg-gray-900">
          {movie.posterPath ? (
            <>
              <img
                src={getImageUrl(movie.posterPath, "w500")}
                alt={movie.title}
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <Film className="text-gray-600" size={80} strokeWidth={1.5} />
            </div>
          )}
          
          {/* Rating Badge */}
          {movie.voteAverage && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-1.5 border border-yellow-500/30"
            >
              <Star className="text-yellow-400 fill-yellow-400" size={18} />
              <span className="text-white font-bold text-lg">{movie.voteAverage.toFixed(1)}</span>
            </motion.div>
          )}
          
          {/* Movie Info Overlay */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="absolute bottom-0 left-0 right-0 p-6"
          >
            <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg line-clamp-2">
              {movie.title}
            </h2>
            
            <div className="flex items-center gap-4 mb-3">
              {movie.releaseDate && (
                <div className="flex items-center gap-1.5 text-gray-200">
                  <Calendar size={16} />
                  <span className="font-medium">{new Date(movie.releaseDate).getFullYear()}</span>
                </div>
              )}
              {movie.voteCount && (
                <span className="text-gray-300 text-sm">
                  {movie.voteCount.toLocaleString()} {language === "en" ? "votes" : "oy"}
                </span>
              )}
            </div>
            
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.slice(0, 3).map((genre, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + idx * 0.1, type: "spring" }}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-medium border border-white/30"
                  >
                    {genre}
                  </motion.span>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
