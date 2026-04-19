# Movier

Swipe-based movie discovery app built with Next.js and TMDB. The project supports anonymous usage via local storage and authenticated usage via Supabase cloud sync.
 It solves the problem of "decision fatigue" by allowing users to quickly discover films through an intuitive swipe interface. 
## Architecture Link
🔗 **[Click here to view the Software Architecture Documentation ](./ARCHITECTURE.md)**

## Features

- Swipe UI for like / skip interactions
- Watchlist panel with batched detail loading
- Movie details modal and trailer support
- Supabase authentication (email/password + Google OAuth)
- Cloud watchlist sync (stores only `movie_id`)
- Avatar upload for email users (Supabase Storage)
- Server-side TMDB proxy (`/api/tmdb`) with short cache

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Framer Motion
- Supabase (Auth, Postgres, Storage)
- TMDB API

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` into `.env.local` and fill values:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `TMDB_API_KEY`

Notes:

- `TMDB_API_KEY` is server-only and used by `app/api/tmdb/route.ts`.
- Do not commit `.env.local`.

### 3. Run Supabase SQL migration

Run `supabase_migration.sql` in the Supabase SQL editor.

This migration includes:

- lean `watchlist` schema
- row-level security policies
- avatar storage bucket and policies
- watchlist size limit trigger

### 4. Start development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint the project

## Public Repo Checklist

- Keep `.env.local` private
- Rotate any key that was ever committed before
- Restrict TMDB key by allowed usage where possible
- Keep Supabase RLS policies enabled

## Project Structure

```text## Project Structure
📦 movier
 ┣ 📂 app
 ┃ ┣ 📂 api
 ┃ ┃ ┣ 📂 embed
 ┃ ┃ ┃ ┗ 📜 route.ts          
 ┃ ┃ ┣ 📂 recommend
 ┃ ┃ ┃ ┗ 📜 route.ts         
 ┃ ┃ ┗ 📂 tmdb
 ┃ ┃   ┗ 📜 route.ts
 ┃ ┣ 📜 globals.css
 ┃ ┣ 📜 layout.tsx
 ┃ ┗ 📜 page.tsx
 ┣ 📂 components
 ┃ ┣ 📜 AuthModal.tsx
 ┃ ┣ 📜 EmptyState.tsx
 ┃ ┣ 📜 FilterBar.tsx
 ┃ ┣ 📜 MovieCard.tsx
 ┃ ┣ 📜 MovieDetailsModal.tsx
 ┃ ┣ 📜 ProfilePanel.tsx
 ┃ ┣ 📜 TmdbImage.tsx
 ┃ ┗ 📜 WatchlistPanel.tsx
 ┣ 📂 lib
 ┃ ┣ 📜 api.ts
 ┃ ┣ 📜 auth-context.tsx
 ┃ ┣ 📜 storage.cloud.ts
 ┃ ┣ 📜 storage.local.ts
 ┃ ┣ 📜 storage.ts
 ┃ ┗ 📜 supabase.ts
 ┣ 📜 instrumentation.ts      
 ┣ 📜 ARCHITECTURE.md
 ┣ 📜 package.json
 ┣ 📜 README.md
 ┗ 📜 supabase_migration.sql
```

## Contributors
* **Mehmet Ali Öztürk** - ID: [230513329] - GitHub: [mehmetali-ozturk]
* **Deniz Eren Gençtürk** - ID: [230513320] - GitHub: [erengc]
* **Ali Yekta Dalkılıç** - ID: [230513306] - GitHub: [Flandsako55]
## License

MIT. See `LICENSE`.
