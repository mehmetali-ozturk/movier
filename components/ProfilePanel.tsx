"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut, Camera, Film, Star, Loader2, Calendar } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Language } from "@/lib/api";
import { cloudUploadAvatar, cloudGetAvatarUrl } from "@/lib/storage.cloud";
import Image from "next/image";

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: SupabaseUser;
  language: Language;
  watchlistCount: number;
  onSignOut: () => void;
}

export default function ProfilePanel({
  isOpen,
  onClose,
  user,
  language,
  watchlistCount,
  onSignOut,
}: ProfilePanelProps) {
  const tr = language === "tr";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isGoogleUser = user.app_metadata?.provider === "google";
  const googleAvatar = user.user_metadata?.avatar_url as string | undefined;
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const memberYear = new Date(user.created_at).getFullYear();
  const memberMonth = new Date(user.created_at).toLocaleString(tr ? "tr-TR" : "en-US", { month: "long", year: "numeric" });

  useEffect(() => {
    if (!isOpen) return;
    if (isGoogleUser && googleAvatar) {
      setAvatarUrl(googleAvatar);
    } else {
      cloudGetAvatarUrl(user.id).then((url) => setAvatarUrl(url));
    }
  }, [isOpen, user.id, isGoogleUser, googleAvatar]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError(tr ? "Dosya 2MB'dan küçük olmalı." : "File must be under 2MB.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError(tr ? "Sadece JPEG, PNG veya WebP desteklenir." : "Only JPEG, PNG or WebP allowed.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    const url = await cloudUploadAvatar(user.id, file);
    if (url) {
      setAvatarUrl(url);
    } else {
      setUploadError(tr ? "Yükleme başarısız oldu." : "Upload failed. Try again.");
    }

    setUploading(false);
    e.target.value = "";
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
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-black border-l border-white/10 z-50 flex flex-col overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-black/95 backdrop-blur-lg border-b border-white/10 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{tr ? "Profil" : "Profile"}</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition">
                <X className="text-gray-400" size={20} />
              </button>
            </div>

            {/* Avatar + identity */}
            <div className="flex flex-col items-center pt-10 pb-6 px-6">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-red-700 to-red-950 flex items-center justify-center ring-4 ring-white/10">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-white text-3xl font-bold select-none">{initials}</span>
                  )}
                </div>

                {/* Upload button — only for non-Google users */}
                {!isGoogleUser && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-full flex items-center justify-center border-2 border-black transition"
                    title={tr ? "Fotoğraf değiştir" : "Change photo"}
                  >
                    {uploading ? (
                      <Loader2 size={14} className="text-white animate-spin" />
                    ) : (
                      <Camera size={14} className="text-white" />
                    )}
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <h3 className="text-white font-semibold text-lg text-center">{displayName}</h3>
              <p className="text-gray-400 text-sm mt-1">{user.email}</p>

              {isGoogleUser && (
                <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600/20 border border-blue-600/40 rounded-full text-blue-400 text-xs font-medium">
                  <svg viewBox="0 0 24 24" width="12" height="12">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </span>
              )}

              {uploadError && (
                <p className="mt-3 text-red-400 text-sm text-center">{uploadError}</p>
              )}

              {!isGoogleUser && (
                <p className="mt-3 text-gray-500 text-xs text-center">
                  {tr ? "Maks. 2MB · JPEG, PNG, WebP" : "Max 2MB · JPEG, PNG, WebP"}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="mx-4 mb-5 grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-1">
                <Film size={20} className="text-red-500" />
                <span className="text-white text-2xl font-bold">{watchlistCount}</span>
                <span className="text-gray-400 text-xs text-center">{tr ? "İzleme Listem" : "Watchlist"}</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-1">
                <Star size={20} className="text-yellow-500" />
                <span className="text-white text-2xl font-bold">{memberYear}</span>
                <span className="text-gray-400 text-xs text-center">{tr ? "Üyelik Yılı" : "Member Since"}</span>
              </div>
            </div>

            {/* Account info */}
            <div className="mx-4 mb-6 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{tr ? "E-posta" : "Email"}</p>
                <p className="text-white text-sm break-all">{user.email}</p>
              </div>
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{tr ? "Giriş Yöntemi" : "Sign-in Method"}</p>
                <p className="text-white text-sm">{isGoogleUser ? "Google OAuth" : tr ? "E-posta & Şifre" : "Email & Password"}</p>
              </div>
              <div className="px-4 py-3 flex items-center gap-2">
                <Calendar size={14} className="text-gray-500 flex-shrink-0" />
                <p className="text-gray-400 text-sm">{tr ? `${memberMonth} tarihinde katıldı` : `Joined ${memberMonth}`}</p>
              </div>
            </div>

            <div className="flex-1" />

            {/* Sign out */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => { onSignOut(); onClose(); }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-400 hover:text-red-300 rounded-xl transition font-medium"
              >
                <LogOut size={18} />
                {tr ? "Çıkış Yap" : "Sign Out"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
