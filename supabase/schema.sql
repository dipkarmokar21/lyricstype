-- ============================================================
-- NitChat Type (LyricsType) — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Tracks table
create table if not exists public.tracks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  artist text not null default 'Anonymous',
  tag text not null default 'Custom',
  youtube_id text default '',
  lines jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 2. Scores / Leaderboard table
create table if not exists public.scores (
  id uuid default gen_random_uuid() primary key,
  player_name text not null,
  track_id uuid references public.tracks(id) on delete cascade,
  wpm integer not null default 0,
  accuracy integer not null default 100,
  score integer not null default 0,
  max_combo integer not null default 0,
  mode text not null default 'solo',
  created_at timestamptz default now()
);

-- Indexes for fast leaderboard queries
create index if not exists idx_scores_wpm on public.scores (wpm desc);
create index if not exists idx_scores_track_id on public.scores (track_id);
create index if not exists idx_scores_player_name on public.scores (player_name);

-- Row Level Security (RLS)
alter table public.tracks enable row level security;
alter table public.scores enable row level security;

-- Public read access for tracks & leaderboard
create policy "Public read tracks" on public.tracks for select using (true);
create policy "Public read scores" on public.scores for select using (true);

