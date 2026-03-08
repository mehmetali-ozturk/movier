import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google profile pictures
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Supabase Storage (any project)
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
