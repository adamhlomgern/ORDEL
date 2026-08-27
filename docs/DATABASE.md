# Ordel — Database

This describes the schema from `supabase/migrations/00000000000002_v01_schema.sql`
and the write path added in `00000000000003_v01_write_path.sql`. No client
ever writes to `games`/`game_players`/`moves` directly — they have zero
mutation grants to `authenticated`/`anon` — writes only happen through the
two Edge Functions under `supabase/functions/` (`create-game`,
`submit-turn-action`), which call `@ordel/game-engine` directly and then
persist through a restricted Postgres function (see `docs/DECISIONS.md`).

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
   way) — plus `my_games`, which backs the Home screen's DIN TUR/VÄNTAR
   grouping and additionally exposes `is_my_turn`, `opponent_id`, and
   `opponent_username` (a self-join against `game_players_public`/
   `profiles` for "the other participant" — unambiguous since Classic games
   always have exactly 2 players, `GAME_RULES.md` section 4).

**Important implementation detail:** these views do their own explicit
`auth.uid()`-based row filtering in their `WHERE` clause, rather than relying
on the base tables' RLS policies being enforced during the view's execution.
A view runs with its owner's privileges by default, and if that owner
happens to be a superuser (true for the default `postgres` role Supabase
migrations run as), RLS — even with `FORCE ROW LEVEL SECURITY` — does not
apply to it at all. Making each view self-filtering means correctness never
depends on that detail. The base-table RLS policies remain as defense in
depth for any future access path that isn't a superuser.

## The write path

Two `SECURITY DEFINER` Postgres functions, executable only by
`service_role` (`revoke ... from public, anon, authenticated`; see
`docs/DECISIONS.md` for why that's safe here and not a repeat of the views
mistake below):

- **`create_classic_game(...)`** — inserts one `games` row + two
  `game_players` rows atomically. Called by `supabase/functions/create-game`
  after it has already shuffled the bag, dealt both racks, and picked the
  starting player in TypeScript via `@ordel/game-engine`. Both players are
  inserted as `'accepted'` and the game starts `'active'` immediately — no
  separate invite/accept step exists yet.
- **`apply_move_result(...)`** — persists one already-validated
  `makeMove()` result: an idempotency pre-check against
  `(game_id, player_id, client_move_id)` (returns the original result on a
  duplicate, never re-applies), a `turn_version`-guarded row lock
  (`for update`, raising `40001` on a mismatch), inserting the `moves` row,
  and updating `games` + `game_players` from the resulting state — all in
  one transaction. Called by `supabase/functions/submit-turn-action`.

`service_role` also holds explicit `select` grants on `profiles`/`games`/
`game_players`/`moves` for the Edge Functions' own direct reads (opponent
lookup, idempotency check, loading current state) — `BYPASSRLS` skips RLS
policies, not table-level grants, so these had to be added explicitly.

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

- `TIMEOUT` handling (a scheduled job, not a client-submitted action).
- A real invite/accept flow (`game_players.status = 'invited'` is currently
  unused — both rows are created `'accepted'` directly).
