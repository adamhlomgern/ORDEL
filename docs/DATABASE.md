# Ordel — Database (V0.1, schema-only slice)

This describes the schema introduced by
`supabase/migrations/00000000000002_v01_schema.sql`. No client code writes to
these tables yet — game creation and move submission are a separate,
not-yet-built slice (an Edge Function calling `@ordel/game-engine`, then a
restricted Postgres function that persists the result atomically; see
`docs/DECISIONS.md`). This migration is additive schema only.

## Tables

- **`profiles`** — `id` references `auth.users`; `username` is a `citext`
  (case-insensitive, case-preserving) unique column. No signup trigger: OTP
  login has no separate signup step, so a client with no `profiles` row
  simply inserts one directly (`with check (id = auth.uid())` plus the
  unique constraint is the whole race-condition guard against two users
  claiming the same name). Usernames are immutable — no UPDATE policy exists.
- **`games`** — the full locked configuration (`rules_version`, `language`,
  `dictionary`, `dictionary_version`, `board_config_id`, `tile_config_id`,
  `tempo`, `turn_duration_hours`) written once at creation
  (`GAME_RULES.md` sections 68-71), plus the mutable current-state snapshot
  (`board_state`, `tile_bag`, `current_turn_player_id`, `turn_version`,
  `scoreless_turn_count`, `end_reason`). `turn_version` is an optimistic
  concurrency token the future write path increments on every committed
  move.
- **`game_players`** — one row per `(game_id, player_id)`: private `rack`,
  `score`, `turn_order`, `has_resigned`.
- **`moves`** — append-only move history (`GAME_RULES.md` section 66-67,
  deterministic replay). `unique(game_id, player_id, client_move_id)` is the
  idempotency guarantee the future write path relies on to safely ignore a
  network-retried submission (`GAME_RULES.md` section 62).

## Row Level Security and column masking

RLS filters _rows_, not _columns per row_ — it cannot express "show this
player their own rack but null out an opponent's" on its own. The design
here uses two layers:

1. **Row policies** on `games`/`game_players`/`moves`: a row is visible only
   to `authenticated` users who participate in that game (checked via a
   `game_players` membership lookup). `profiles` is fully readable by any
   authenticated user (usernames aren't sensitive).
2. **No direct `GRANT` to `authenticated`/`anon`** on `games`, `game_players`,
   or `moves`. Clients can only read through three views —
   `games_public` (omits `tile_bag` entirely, exposes only
   `tile_bag_remaining`, per `GAME_RULES.md` section 4), `game_players_public`
   (masks `rack` to `null` unless `player_id = auth.uid()`, always exposes
   `rack_tile_count`), and `moves_public` (masks `swapped_tile_ids` the same
   way) — plus a convenience `my_games` view backing the future Home
   screen's "YOUR TURN"/"WAITING" grouping.

**Important implementation detail:** these views do their own explicit
`auth.uid()`-based row filtering in their `WHERE` clause, rather than relying
on the base tables' RLS policies being enforced during the view's execution.
A view runs with its owner's privileges by default, and if that owner
happens to be a superuser (true for the default `postgres` role Supabase
migrations run as), RLS — even with `FORCE ROW LEVEL SECURITY` — does not
apply to it at all. Making each view self-filtering means correctness never
depends on that detail. The base-table RLS policies remain as defense in
depth for any future access path that isn't a superuser.

## `app_health`

Still present from V0.0 as the connectivity smoke test the app's Home screen
checks on launch. It will be retired once a real query (e.g. against
`my_games`) exercises the full stack instead — not urgent, so it hasn't been
dropped yet to avoid unnecessary migration churn before it's actually
replaced.

## Conventions carried forward

- Every table gets RLS enabled (and forced) at creation time — never added
  later as an afterthought (`MASTER_PRODUCT_BRIEF.md` section 40).
- Every schema change is a migration in `supabase/migrations/`, documented
  here, never applied by hand against a running database
  (`MASTER_PRODUCT_BRIEF.md` section 72).
- Game-critical fields are locked at creation time and never mutated
  (`GAME_RULES.md` sections 68-71).

## Not yet designed (deferred)

- The Edge Function / restricted Postgres function write path that actually
  populates these tables.
- `TIMEOUT` handling (a scheduled job, not a client-submitted action).
- Game creation / invite-acceptance (dealing racks, shuffling the bag,
  picking the starting player).
