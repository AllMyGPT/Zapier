-- Pizarra Club Manager: tenant aislado en su propio esquema dentro de la base compartida.
-- Aplicada en el proyecto EmotivOS (fpjsbjybsnnyanxgygvn) el 15/11/2026.
create schema if not exists pizarra;
grant usage on schema pizarra to anon, authenticated, service_role;

create table if not exists pizarra.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slot int not null check (slot between 1 and 10),
  name text not null default '',
  club text not null default '',
  season text not null default '',
  data text not null check (length(data) < 8000000),
  updated_at timestamptz not null default now(),
  unique (user_id, slot)
);
alter table pizarra.saves enable row level security;
create policy "saves_select_own" on pizarra.saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "saves_insert_own" on pizarra.saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "saves_update_own" on pizarra.saves for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "saves_delete_own" on pizarra.saves for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on pizarra.saves to authenticated;
grant all on pizarra.saves to service_role;

create table if not exists pizarra.hall_of_fame (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  manager text not null check (length(manager) <= 40),
  club text not null check (length(club) <= 80),
  season text not null check (length(season) <= 10),
  achievement text not null check (length(achievement) <= 200),
  created_at timestamptz not null default now()
);
create index if not exists hall_of_fame_user_idx on pizarra.hall_of_fame (user_id);
alter table pizarra.hall_of_fame enable row level security;
create policy "hof_read_all" on pizarra.hall_of_fame for select to anon, authenticated using (true);
create policy "hof_insert_own" on pizarra.hall_of_fame for insert to authenticated with check ((select auth.uid()) = user_id);
grant select on pizarra.hall_of_fame to anon, authenticated;
grant insert on pizarra.hall_of_fame to authenticated;
grant all on pizarra.hall_of_fame to service_role;

-- Exponer el esquema en la API manteniendo los ya existentes de EmotivOS.
-- Si se cambian los "Exposed schemas" desde el panel, conservar "pizarra".
alter role authenticator set pgrst.db_schemas = 'public, extensions, clara, contabilidad, pizarra';
notify pgrst, 'reload config';
notify pgrst, 'reload schema';
