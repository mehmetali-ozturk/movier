"use client";

import { SlidersHorizontal, RotateCcw, Film } from "lucide-react";
import { Language } from "@/lib/api";

interface NoResultsProps {
  type: "no-results";
  language: Language;
  onEditFilters: () => void;
  onClearFilters: () => void;
}

interface AllSeenProps {
  type: "all-seen";
  language: Language;
  onLoadMore: () => void;
}

type EmptyStateProps = NoResultsProps | AllSeenProps;

export default function EmptyState(props: EmptyStateProps) {
  const tr = props.language === "tr";

  if (props.type === "no-results") {
    return (
      <div className="text-center px-6">
        <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <SlidersHorizontal className="text-gray-500" size={40} strokeWidth={1.5} />
        </div>
        <h3 className="text-white text-xl font-bold mb-2">
          {tr ? "Film bulunamadı" : "No movies found"}
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          {tr
            ? "Seçili filtrelerle eşleşen film yok. Filtreleri düzenlemeyi veya sıfırlamayı deneyin."
            : "No movies match your current filters. Try adjusting or resetting them."}
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={props.onEditFilters}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
          >
            <SlidersHorizontal size={18} />
            {tr ? "Filtreleri Düzenle" : "Edit Filters"}
          </button>
          <button
            onClick={props.onClearFilters}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition"
          >
            <RotateCcw size={18} />
            {tr ? "Filtreleri Sıfırla" : "Clear Filters"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center px-6">
      <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
        <Film className="text-gray-500" size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-white text-xl font-bold mb-2">
        {tr ? "Hepsini izledin!" : "You've seen them all!"}
      </h3>
      <p className="text-gray-400 text-sm mb-6">
        {tr
          ? "Tüm filmleri geçtin. Keşfetmeye devam etmek için daha fazla yükle."
          : "You've gone through all the movies. Load more to keep discovering."}
      </p>
      <button
        onClick={props.onLoadMore}
        className="flex items-center gap-2 mx-auto px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
      >
        <RotateCcw size={20} />
        {tr ? "Daha Fazla Yükle" : "Load More Movies"}
      </button>
    </div>
  );
}
