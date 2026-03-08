"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Check, RotateCcw } from "lucide-react";
import { Language, FilterOptions } from "@/lib/api";

const GENRES = [
  { id: 28, en: "Action", tr: "Aksiyon" },
  { id: 35, en: "Comedy", tr: "Komedi" },
  { id: 18, en: "Drama", tr: "Drama" },
  { id: 27, en: "Horror", tr: "Korku" },
  { id: 878, en: "Sci-Fi", tr: "Bilim Kurgu" },
  { id: 10749, en: "Romance", tr: "Romantik" },
  { id: 16, en: "Animation", tr: "Animasyon" },
  { id: 53, en: "Thriller", tr: "Gerilim" },
  { id: 12, en: "Adventure", tr: "Macera" },
  { id: 80, en: "Crime", tr: "Suç" },
  { id: 99, en: "Documentary", tr: "Belgesel" },
  { id: 14, en: "Fantasy", tr: "Fantastik" },
];

const YEAR_RANGES = [
  { label: { en: "2020s", tr: "2020'ler" }, from: 2020, to: 2029 },
  { label: { en: "2010s", tr: "2010'lar" }, from: 2010, to: 2019 },
  { label: { en: "2000s", tr: "2000'ler" }, from: 2000, to: 2009 },
  { label: { en: "90s", tr: "90'lar" }, from: 1990, to: 1999 },
  { label: { en: "Classics", tr: "Klasikler" }, from: 1900, to: 1989 },
];

const RATINGS = [
  { label: "6+", value: 6 },
  { label: "7+", value: 7 },
  { label: "8+", value: 8 },
  { label: "9+", value: 9 },
];

const VOTE_COUNTS = [
  { label: { en: "100+ votes", tr: "100+ oy" }, value: 100 },
  { label: { en: "500+ votes", tr: "500+ oy" }, value: 500 },
  { label: { en: "1K+ votes", tr: "1B+ oy" }, value: 1000 },
  { label: { en: "5K+ votes", tr: "5B+ oy" }, value: 5000 },
  { label: { en: "10K+ votes", tr: "10B+ oy" }, value: 10000 },
];

interface FilterBarProps {
  isOpen: boolean;
  filters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
  language: Language;
  onClose: () => void;
}

export default function FilterBar({ isOpen, filters, onApply, language, onClose }: FilterBarProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const t = (en: string, tr: string) => language === "tr" ? tr : en;

  const toggleGenre = (genreId: number) => {
    const current = localFilters.genreIds || [];
    const updated = current.includes(genreId)
      ? current.filter(id => id !== genreId)
      : [...current, genreId];
    setLocalFilters(prev => ({ ...prev, genreIds: updated }));
  };

  const setRating = (rating: number) => {
    setLocalFilters(prev => ({
      ...prev,
      minRating: prev.minRating === rating ? undefined : rating,
    }));
  };

  const setVoteCount = (count: number) => {
    setLocalFilters(prev => ({
      ...prev,
      minVoteCount: prev.minVoteCount === count ? undefined : count,
    }));
  };

  const setYearRange = (from: number, to: number) => {
    const isSame = localFilters.yearFrom === from && localFilters.yearTo === to;
    setLocalFilters(prev => ({
      ...prev,
      yearFrom: isSame ? undefined : from,
      yearTo: isSame ? undefined : to,
    }));
  };

  const handleReset = () => setLocalFilters({});

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const activeCount =
    (localFilters.genreIds?.length || 0) +
    (localFilters.minRating !== undefined ? 1 : 0) +
    (localFilters.yearFrom !== undefined ? 1 : 0) +
    (localFilters.minVoteCount !== undefined ? 1 : 0);

  const pill = (selected: boolean) =>
    `px-3 py-1.5 rounded-full text-sm transition border ${
      selected
        ? "bg-red-600 border-red-500 text-white"
        : "bg-white/5 border-white/20 text-gray-300 hover:border-red-600/50 hover:text-white"
    }`;

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
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-black border-l border-red-600/30 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-red-600/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="text-red-500" size={20} />
                  <h2 className="text-2xl font-bold text-white">{t("Filters", "Filtreler")}</h2>
                  {activeCount > 0 && (
                    <span className="w-6 h-6 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {activeCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <X className="text-white" size={24} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

              {/* Genre */}
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">{t("Genre", "Tür")}</p>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(genre => (
                    <button
                      key={genre.id}
                      onClick={() => toggleGenre(genre.id)}
                      className={pill((localFilters.genreIds || []).includes(genre.id))}
                    >
                      {language === "tr" ? genre.tr : genre.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
                  {t("Minimum Rating", "Minimum Puan")}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {RATINGS.map(rating => (
                    <button
                      key={rating.value}
                      onClick={() => setRating(rating.value)}
                      className={pill(localFilters.minRating === rating.value)}
                    >
                      ⭐ {rating.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimum Vote Count */}
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
                  {t("Minimum Votes", "Minimum Oy Sayısı")}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {VOTE_COUNTS.map(vc => (
                    <button
                      key={vc.value}
                      onClick={() => setVoteCount(vc.value)}
                      className={pill(localFilters.minVoteCount === vc.value)}
                    >
                      {language === "tr" ? vc.label.tr : vc.label.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Release Period */}
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
                  {t("Release Period", "Çıkış Dönemi")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {YEAR_RANGES.map(range => (
                    <button
                      key={range.from}
                      onClick={() => setYearRange(range.from, range.to)}
                      className={pill(localFilters.yearFrom === range.from && localFilters.yearTo === range.to)}
                    >
                      {language === "tr" ? range.label.tr : range.label.en}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-red-600/30 flex gap-3">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition font-medium"
              >
                <RotateCcw size={16} />
                {t("Reset", "Sıfırla")}
              </button>
              <button
                onClick={handleApply}
                className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition font-medium"
              >
                <Check size={18} />
                {t("Apply", "Uygula")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
