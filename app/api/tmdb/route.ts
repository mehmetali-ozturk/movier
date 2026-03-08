import { NextRequest, NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY ?? "";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Allowlist: only these path prefixes are proxied
const ALLOWED_PREFIXES = ["/movie/", "/discover/movie"];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const path = searchParams.get("path");

  if (!path || !ALLOWED_PREFIXES.some(p => path.startsWith(p))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  // Forward all query params except "path", then inject api_key server-side
  const upstream = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== "path") upstream.set(key, value);
  });
  upstream.set("api_key", TMDB_API_KEY);

  try {
    const res = await fetch(`${TMDB_BASE_URL}${path}?${upstream}`, {
      next: { revalidate: 60 }, // cache 60s on the server
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}
