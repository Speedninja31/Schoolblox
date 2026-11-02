-- SchoolBlox accounts: cloud saves.
-- Run this ONCE in Supabase: SQL Editor -> New query -> paste -> Run.
-- (Also: Authentication -> Sign In / Providers -> Email -> turn OFF "Confirm email". Usernames are turned into
--  hidden emails like name@schoolblox.app, so no real email is ever collected or confirmed.)

create table if not exists public.saves (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint saves_size check (octet_length(data::text) < 1500000)
);

-- the server (not the browser) stamps the save time
create or replace function public.saves_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists saves_touch on public.saves;
create trigger saves_touch before insert or update on public.saves
  for each row execute function public.saves_touch();

-- each player can only ever see and change their OWN save
alter table public.saves enable row level security;

drop policy if exists "own save: read"   on public.saves;
drop policy if exists "own save: insert" on public.saves;
drop policy if exists "own save: update" on public.saves;

create policy "own save: read"   on public.saves for select to authenticated using (auth.uid() = user_id);
create policy "own save: insert" on public.saves for insert to authenticated with check (auth.uid() = user_id);
create policy "own save: update" on public.saves for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- nobody (including logged-out visitors) gets delete or any access beyond the three policies above
revoke all on public.saves from anon;
grant select, insert, update on public.saves to authenticated;
