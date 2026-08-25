-- V0.0 connectivity smoke test table.
--
-- Purpose: prove the full client -> Supabase -> Postgres -> RLS path works
-- end-to-end before any real product schema exists (MASTER_PRODUCT_BRIEF.md
-- section 53 acceptance criterion "Supabase development connection works",
-- and section 40: RLS must be designed in from the beginning).
--
-- This table is temporary scaffolding. It is superseded once V0.1 designs
-- the real schema (profiles/games/game_players/moves) per docs/DATABASE.md.

create table if not exists public.app_health (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now()
);

alter table public.app_health enable row level security;

-- Permissive by design: this table holds no user data and exists solely to
-- prove an authenticated-or-anonymous client can read through RLS.
create policy "app_health is readable by anyone"
  on public.app_health
  for select
  using (true);

-- Recent Supabase CLI versions no longer auto-expose new public-schema
-- tables to the Data API roles (matches the cloud default). RLS alone is not
-- sufficient without the underlying GRANT.
grant select on public.app_health to anon, authenticated;
