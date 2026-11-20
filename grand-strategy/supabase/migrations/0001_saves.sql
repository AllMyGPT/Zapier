-- "Gran Estrategia" runs as an independent tenant inside an existing Supabase database:
-- its own schema, its own table and per-user RLS. Applied to the EmotivOS project.
create schema if not exists gran_estrategia;
revoke all on schema gran_estrategia from public, anon;
grant usage on schema gran_estrategia to authenticated, service_role;

create table if not exists gran_estrategia.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  era text not null,
  scenario text not null,
  game_date text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists saves_user_idx on gran_estrategia.saves (user_id, updated_at desc);

alter table gran_estrategia.saves enable row level security;
create policy "own saves: select" on gran_estrategia.saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "own saves: insert" on gran_estrategia.saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own saves: update" on gran_estrategia.saves for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own saves: delete" on gran_estrategia.saves for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on gran_estrategia.saves from anon, public;
grant select, insert, update, delete on gran_estrategia.saves to authenticated;
grant all on gran_estrategia.saves to service_role;

-- Expose the schema through the Data API (keep the schemas other apps already expose):
-- alter role authenticator set pgrst.db_schemas = 'public, extensions, clara, contabilidad, gran_estrategia';
-- notify pgrst, 'reload config';
