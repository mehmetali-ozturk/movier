"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Movie, Language,getImageUrl } from "@/lib/api";
import { Star, Calendar, Heart, X, Film, ChevronUp } from "lucide-react";
import TmdbImage from "@/components/TmdbImage";

interface MovieCardProps {
  movie: Movie;
  nextMovie?: Movie;
  onSwipe: (direction: "left" | "right" | "up") => void;
  language: Language;
}

export default function MovieCard({ movie, nextMovie, onSwipe, language }: MovieCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const smoothX = useSpring(x, { stiffness: 400, damping: 40 });

  const rotate = useTransform(x, [-250, 0, 250], [-35, 0, 35]);
  const opacity = useTransform(x, [-250, -180, 0, 180, 250], [0, 1, 1, 1, 0]);

  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);
  const upOpacity = useTransform(y, [-80, 0], [1, 0]);

  const backCardScale = useTransform(x, [-250, 0, 250], [1, 0.92, 1]);
  const backCardOpacity = useTransform(x, [-250, -100, 0, 100, 250], [1, 0.8, 0.6, 0.8, 1]);
  const backCardBlur = useTransform(x, [-250, 0, 250], [0, 8, 0]);

  const likeOverlayOpacity = useTransform(x, [0, 120], [0, 0.75]);
  const nopeOverlayOpacity = useTransform(x, [-120, 0], [0.75, 0]);
  const upOverlayOpacity = useTransform(y, [-120, 0], [0.75, 0]);

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 100;
    if (info.offset.y < -threshold && Math.abs(info.offset.x) < threshold) {
      onSwipe("up");
    } else if (info.offset.x > threshold) {
      // GEREKSİZ FETCH KALDIRILDI!
      // Sadece onSwipe çağırıyoruz, veri işleme mantığı page.tsx'te kalıyor.
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      onSwipe("left");
    }
  };

  return (
    <div className="relative w-full max-w-sm" style={{ height: "600px" }}>
      {nextMovie && (
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl"
          style={{
            scale: backCardScale,
            opacity: backCardOpacity,
            translateY: 16,
            zIndex: 0,
          }}
        >
          {nextMovie.posterPath ? (
            <TmdbImage
              path={nextMovie.posterPath}
              size="w500"
              alt={nextMovie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-800" />
          )}
          <motion.div
            className="absolute inset-0 bg-black/50"
            style={{ backdropFilter: useTransform(backCardBlur, v => `blur(${v}px)`) }}
          />
        </motion.div>
      )}

      <motion.div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ x, y, rotate, opacity, zIndex: 1 }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
      >
        <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl">
          <motion.div
            className="absolute inset-0 z-10 rounded-2xl pointer-events-none"
            style={{
              opacity: likeOverlayOpacity,
              background: "linear-gradient(to left, rgba(34,197,94,0.9) 0%, rgba(34,197,94,0.5) 30%, transparent 70%)",
            }}
          />
          <motion.div
            className="absolute inset-0 z-10 rounded-2xl pointer-events-none"
            style={{
              opacity: nopeOverlayOpacity,
              background: "linear-gradient(to right, rgba(239,68,68,0.9) 0%, rgba(239,68,68,0.5) 30%, transparent 70%)",
            }}
          />
          <motion.div
            className="absolute inset-0 z-10 rounded-2xl pointer-events-none"
            style={{
              opacity: upOverlayOpacity,
              background: "linear-gradient(to bottom, rgba(59,130,246,0.9) 0%, rgba(59,130,246,0.5) 30%, transparent 70%)",
            }}
          />

          <motion.div
            style={{ opacity: likeOpacity, scale: likeOpacity }}
            className="absolute top-10 right-8 z-20 w-16 h-16 rounded-full bg-black/30 backdrop-blur-md border-[3px] border-green-400 flex items-center justify-center shadow-xl shadow-green-500/40"
          >
            <Heart className="text-green-400" size={30} fill="currentColor" />
          </motion.div>

          <motion.div
            style={{ opacity: nopeOpacity, scale: nopeOpacity }}
            className="absolute top-10 left-8 z-20 w-16 h-16 rounded-full bg-black/30 backdrop-blur-md border-[3px] border-red-400 flex items-center justify-center shadow-xl shadow-red-500/40"
          >
            <X className="text-red-400" size={30} strokeWidth={3} />
          </motion.div>

          <motion.div
            style={{ opacity: upOpacity, scale: upOpacity }}
            className="absolute top-10 left-1/2 -translate-x-1/2 z-20 w-16 h-16 rounded-full bg-black/30 backdrop-blur-md border-[3px] border-blue-400 flex items-center justify-center shadow-xl shadow-blue-500/40"
          >
            <ChevronUp className="text-blue-400" size={30} strokeWidth={3} />
          </motion.div>

          <div className="relative h-full bg-gray-900">
            {movie.posterPath ? (
              <>
                <TmdbImage
                  path={movie.posterPath}
                  size="w500"
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  iconSize={80}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <Film className="text-gray-600" size={80} strokeWidth={1.5} />
              </div>
            )}

            {movie.voteAverage && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-2 rounded-xl flex items-center gap-1.5 border border-yellow-500/40 shadow-lg"
              >
                <Star className="text-yellow-400 fill-yellow-400" size={16} />
                <span className="text-white font-bold text-base">{movie.voteAverage.toFixed(1)}</span>
              </motion.div>
            )}

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50"
            >
              <ChevronUp className="text-white" size={20} />
              <span className="text-white text-[10px] font-medium tracking-widest uppercase">Detay</span>
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring" }}
              className="absolute bottom-0 left-0 right-0 p-6"
            >
              <h2 className="text-3xl font-black text-white mb-2 drop-shadow-lg line-clamp-2 leading-tight">
                {movie.title}
              </h2>
              <div className="flex items-center gap-4 mb-3">
                {movie.releaseDate && (
                  <div className="flex items-center gap-1.5 text-gray-200">
                    <Calendar size={15} />
                    <span className="font-semibold text-sm">{new Date(movie.releaseDate).getFullYear()}</span>
                  </div>
                )}
                {movie.voteCount && (
                  <span className="text-gray-400 text-xs">
                    {movie.voteCount.toLocaleString()} {language === "en" ? "votes" : "oy"}
                  </span>
                )}
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {movie.genres.slice(0, 3).map((genre, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.25 + idx * 0.08, type: "spring" }}
                      className="px-3 py-1 bg-white/15 backdrop-blur-sm text-white rounded-full text-xs font-semibold border border-white/25"
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
    </div>
  );
}