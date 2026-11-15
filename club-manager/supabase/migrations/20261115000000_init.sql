-- Pizarra Club Manager: partidas guardadas por usuario
create table if not exists public.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slot int not null check (slot between 1 and 10),
  name text not null default '',
  club text not null default '',
  season text not null default '',
  data text not null,
  updated_at timestamptz not null default now(),
  unique (user_id, slot)
);

alter table public.saves enable row level security;

create policy "saves_select_own" on public.saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "saves_insert_own" on public.saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "saves_update_own" on public.saves for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "saves_delete_own" on public.saves for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists saves_user_idx on public.saves (user_id);

-- Salón de la fama público (opcional): mejores temporadas de los mánagers
create table if not exists public.hall_of_fame (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  manager text not null,
  club text not null,
  season text not null,
  achievement text not null,
  created_at timestamptz not null default now()
);
alter table public.hall_of_fame enable row level security;
create policy "hof_read_all" on public.hall_of_fame for select to anon, authenticated using (true);
create policy "hof_insert_own" on public.hall_of_fame for insert to authenticated with check ((select auth.uid()) = user_id);
