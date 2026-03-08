"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, LogIn, UserPlus, Film, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Language } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

type Mode = "signin" | "signup";

export default function AuthModal({ isOpen, onClose, language }: AuthModalProps) {
  const supabase = createClient();
  const tr = language === "tr";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const t = (en: string, trStr: string) => (tr ? trStr : en);

  const reset = () => {
    setError(null);
    setSuccess(null);
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(tr ? "E-posta veya şifre hatalı." : "Invalid email or password.");
      } else {
        onClose();
        reset();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(
          tr
            ? "Hesap oluşturuldu! E-posta adresinizi onaylayın."
            : "Account created! Please confirm your email."
        );
      }
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-sm bg-black border border-red-600/30 rounded-2xl overflow-hidden pointer-events-auto shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-red-600/20">
                <div className="flex items-center gap-2">
                  <Film className="text-red-600" size={22} />
                  <span className="text-white font-bold text-lg">Movier</span>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <X className="text-white" size={18} />
                </button>
              </div>

              <div className="p-5">
                {/* Mode Tabs */}
                <div className="flex bg-white/5 rounded-xl p-1 mb-5">
                  <button
                    onClick={() => { setMode("signin"); reset(); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                      mode === "signin" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <LogIn size={14} />
                      {t("Sign In", "Giriş Yap")}
                    </span>
                  </button>
                  <button
                    onClick={() => { setMode("signup"); reset(); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                      mode === "signup" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <UserPlus size={14} />
                      {t("Sign Up", "Kayıt Ol")}
                    </span>
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t("E-mail", "E-posta")}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-600/60"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={t("Password", "Şifre")}
                      required
                      minLength={6}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-600/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {error && (
                    <p className="text-red-400 text-xs bg-red-600/10 border border-red-600/20 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}
                  {success && (
                    <p className="text-green-400 text-xs bg-green-600/10 border border-green-600/20 rounded-lg px-3 py-2">
                      {success}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl font-medium text-sm transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : mode === "signin" ? (
                      <><LogIn size={16} /> {t("Sign In", "Giriş Yap")}</>
                    ) : (
                      <><UserPlus size={16} /> {t("Create Account", "Hesap Oluştur")}</>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-gray-500 text-xs">{t("or", "veya")}</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Google Sign In */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-60 border border-white/10 text-white rounded-xl font-medium text-sm transition flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {t("Continue with Google", "Google ile Devam Et")}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
