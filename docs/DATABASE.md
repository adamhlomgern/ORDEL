# Ordel — Database (V0.0)

No application schema exists yet. This document will be filled in during V0.1
per `MASTER_PRODUCT_BRIEF.md` sections 41-42 (conceptual entities: `profiles`,
`friendships`, `games`, `game_players`, `moves`, etc.).

## What exists today

A single table, purely as a connectivity smoke test:

```sql
create table public.app_health (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now()
);
```

- Migration: `supabase/migrations/00000000000001_app_health.sql`
- Seed: `supabase/seed/seed.sql` inserts one row.
- **Row Level Security is enabled**, with a permissive `select` policy. This
  table holds no user data — its only purpose is proving that a client can
  read through Postgres + RLS end-to-end before any real schema exists
  (`MASTER_PRODUCT_BRIEF.md` section 53 acceptance criterion: "Supabase
  development connection works").

`app_health` is **temporary scaffolding**. It will be removed (via a new
migration, never edited in place) once V0.1 introduces the real schema.

## Conventions to carry into V0.1

- Every table gets RLS enabled at creation time — never added later as an
  afterthought (`MASTER_PRODUCT_BRIEF.md` section 40).
- Every schema change is a migration in `supabase/migrations/`, documented
  here, never applied by hand against a running database
  (`MASTER_PRODUCT_BRIEF.md` section 72).
- Game-critical fields (`dictionary_version`, `board_configuration`,
  `tile_configuration`, `rules_version`) must be stored per-game and locked at
  creation time (`GAME_RULES.md` sections 68-71) — this drives the `games`
  table design in V0.1.
