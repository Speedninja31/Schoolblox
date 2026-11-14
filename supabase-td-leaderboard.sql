-- OPTIONAL: global Tower Defense leaderboard.
-- Without this table the in-game leaderboard still works: it ranks the players currently in your lobby using the stats they broadcast.
-- Run this once in the Supabase SQL editor to also get an all-time top list. (Players can only write their own row.)
create table if not exists public.td_scores (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  wins int not null default 0,
  kills int not null default 0,
  matches int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.td_scores enable row level security;
drop policy if exists "td scores: read all" on public.td_scores;
drop policy if exists "td scores: insert own" on public.td_scores;
drop policy if exists "td scores: update own" on public.td_scores;
create policy "td scores: read all"   on public.td_scores for select to anon, authenticated using (true);
create policy "td scores: insert own" on public.td_scores for insert to authenticated with check (auth.uid() = user_id);
create policy "td scores: update own" on public.td_scores for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select on public.td_scores to anon, authenticated;
grant insert, update on public.td_scores to authenticated;
