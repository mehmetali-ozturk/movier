-- Supabase SQL Migration
-- Run this in your Supabase project: SQL Editor > New Query

-- Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- Watchlist table (lean: only IDs stored, details fetched from TMDB)
create table if not exists public.watchlist (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  movie_id   integer not null,
  watched    boolean not null default false,
  added_at   timestamptz not null default now(),
  unique (user_id, movie_id)
);

-- If upgrading an existing installation, drop the old detail columns:
alter table public.watchlist
  drop column if exists title,
  drop column if exists original_title,
  drop column if exists overview,
  drop column if exists poster_path,
  drop column if exists backdrop_path,
  drop column if exists release_date,
  drop column if exists vote_average,
  drop column if exists vote_count,
  drop column if exists genres,
  drop column if exists language,
  drop column if exists runtime;

-- User preferences table (language, filters)
create table if not exists public.user_preferences (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  language      text not null default 'en',
  updated_at    timestamptz not null default now()
);

-- Row Level Security
alter table public.watchlist enable row level security;
alter table public.user_preferences enable row level security;

-- Policies: users can only see/modify their own data
create policy "Users can view own watchlist"
  on public.watchlist for select
  using (auth.uid() = user_id);

create policy "Users can insert own watchlist"
  on public.watchlist for insert
  with check (auth.uid() = user_id);

create policy "Users can update own watchlist"
  on public.watchlist for update
  using (auth.uid() = user_id);

create policy "Users can delete own watchlist"
  on public.watchlist for delete
  using (auth.uid() = user_id);

create policy "Users can view own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can upsert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

-- ============================================================
-- Avatar URL column (run once, safe to re-run)
-- ============================================================
alter table public.user_preferences
  add column if not exists avatar_url text;

-- ============================================================
-- Storage: avatars bucket
-- Run in Supabase SQL Editor (requires storage extension)
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,                              -- public so Next.js <Image> can load without signed URLs
  2097152,                           -- 2 MB hard limit per file
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Storage RLS policies
create policy "Avatar public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- Watchlist row-count guard (max 500 movies per user)
-- ============================================================
create or replace function check_watchlist_limit()
returns trigger as $$
begin
  if (select count(*) from public.watchlist where user_id = NEW.user_id) >= 500 then
    raise exception 'Watchlist limit reached (max 500 movies).';
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists enforce_watchlist_limit on public.watchlist;
create trigger enforce_watchlist_limit
  before insert on public.watchlist
  for each row execute function check_watchlist_limit();
