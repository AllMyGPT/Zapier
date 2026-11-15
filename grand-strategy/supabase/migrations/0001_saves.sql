-- Cloud save games. Each row is one full serialized GameState.
create table if not exists public.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  era text not null,
  scenario text not null,
  game_date text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists saves_user_idx on public.saves (user_id, updated_at desc);
alter table public.saves enable row level security;
create policy "own saves: select" on public.saves for select using ((select auth.uid()) = user_id);
create policy "own saves: insert" on public.saves for insert with check ((select auth.uid()) = user_id);
create policy "own saves: update" on public.saves for update using ((select auth.uid()) = user_id);
create policy "own saves: delete" on public.saves for delete using ((select auth.uid()) = user_id);
