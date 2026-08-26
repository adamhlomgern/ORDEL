-- V0.1 schema: profiles, games, game_players, moves.
--
-- Design principle (see docs/DECISIONS.md): `moves` is the append-only
-- ground truth (GAME_RULES.md section 66-67, deterministic replay).
-- `games`/`game_players` hold a materialized current-state snapshot that is
-- only ever written atomically alongside the move that produced it — never
-- independently. That write path (a Supabase Edge Function calling
-- @ordel/game-engine, then a restricted Postgres function to persist the
-- result) is a separate, not-yet-built slice. This migration is additive
-- schema only: no mutation policies exist yet for games/game_players/moves,
-- so it is safely inert until that write path exists.

create extension if not exists citext;

-- ============================================================================
-- Tables
-- ============================================================================

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   citext not null unique,
  created_at timestamptz not null default now()
);

create table public.games (
  id                     uuid primary key default gen_random_uuid(),
  status                 text not null default 'pending' check (status in ('pending', 'active', 'completed')),
  mode                   text not null default 'classic' check (mode = 'classic'),
  rules_version          text not null,
  language               text not null,
  dictionary             text not null,
  dictionary_version     text not null,
  board_config_id        text not null,
  tile_config_id         text not null,
  tempo                  text not null check (tempo in ('LUGN', 'NORMAL', 'SNABB', 'INGEN GRÄNS')),
  turn_duration_hours    integer null,
  board_state            jsonb not null default '[]'::jsonb,
  tile_bag               jsonb not null default '[]'::jsonb,
  current_turn_player_id uuid null references public.profiles (id),
  turn_version           integer not null default 0,
  turn_started_at        timestamptz null,
  scoreless_turn_count   integer not null default 0,
  end_reason             text null check (end_reason in ('played_out', 'scoreless_turns', 'resignation', 'timeout')),
  created_by             uuid not null references public.profiles (id),
  created_at             timestamptz not null default now(),
  started_at             timestamptz null,
  completed_at           timestamptz null,

  constraint turn_duration_matches_tempo check (
    (tempo = 'INGEN GRÄNS' and turn_duration_hours is null)
    or (tempo <> 'INGEN GRÄNS' and turn_duration_hours is not null)
  )
);

create table public.game_players (
  game_id      uuid not null references public.games (id) on delete cascade,
  player_id    uuid not null references public.profiles (id),
  status       text not null default 'invited' check (status in ('invited', 'accepted')),
  rack         jsonb not null default '[]'::jsonb,
  score        integer not null default 0,
  turn_order   integer not null,
  has_resigned boolean not null default false,
  joined_at    timestamptz null,

  primary key (game_id, player_id)
);

create table public.moves (
  id               uuid primary key default gen_random_uuid(),
  game_id          uuid not null references public.games (id) on delete cascade,
  move_number      integer not null,
  player_id        uuid null references public.profiles (id),
  action_type      text not null check (action_type in ('PLAY', 'PASS', 'SWAP', 'RESIGN', 'TIMEOUT', 'GAME_END')),
  client_move_id   uuid not null,
  placements       jsonb null,
  words_created    jsonb null,
  score            integer not null default 0,
  sjua_bonus       boolean not null default false,
  swapped_tile_ids jsonb null,
  committed_at     timestamptz not null default now(),

  unique (game_id, move_number),
  unique (game_id, player_id, client_move_id)
);

-- ============================================================================
-- Row Level Security
-- ============================================================================
-- RLS filters *rows*; it cannot filter *columns* per row (a player's own
-- rack vs. an opponent's). Column masking is handled separately by the
-- views below, which do their own explicit `auth.uid()` filtering rather
-- than depending on RLS being enforced inside the view — see the comment
-- above the views section for why.

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.games enable row level security;
alter table public.games force row level security;
alter table public.game_players enable row level security;
alter table public.game_players force row level security;
alter table public.moves enable row level security;
alter table public.moves force row level security;

-- Usernames are not sensitive and must be readable by any authenticated user
-- (opponent search/selection). No friendships table exists yet (V0.3 scope).
create policy "profiles are readable by any authenticated user"
  on public.profiles
  for select
  to authenticated
  using (true);

-- The only mutation policy in this migration. OTP login has no separate
-- signup step (see docs/DATABASE.md) — a client with no profiles row inserts
-- its own row directly; the citext unique constraint is the race-condition
-- guard against two users claiming the same name concurrently.
create policy "a user may create their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

-- Deliberately no UPDATE policy: usernames are immutable in V0.1 (avoids
-- stale-username display in historical moves/game_players).

create policy "participants can see their own games"
  on public.games
  for select
  to authenticated
  using (
    exists (
      select 1 from public.game_players gp
      where gp.game_id = games.id and gp.player_id = auth.uid()
    )
  );

create policy "participants can see the player rows for their own games"
  on public.game_players
  for select
  to authenticated
  using (
    exists (
      select 1 from public.game_players self
      where self.game_id = game_players.game_id and self.player_id = auth.uid()
    )
  );

create policy "participants can see the move history for their own games"
  on public.moves
  for select
  to authenticated
  using (
    exists (
      select 1 from public.game_players gp
      where gp.game_id = moves.game_id and gp.player_id = auth.uid()
    )
  );

-- No mutation policies exist for games/game_players/moves: they are only
-- ever written by the (not-yet-built) service-role write path, never
-- directly by a client.

grant select, insert on public.profiles to authenticated;

-- Deliberately NOT granted to authenticated/anon: games/game_players/moves
-- are readable by clients only through the masking views below, which omit
-- (`games.tile_bag`) or mask (`game_players.rack`, `moves.swapped_tile_ids`)
-- the columns a client must never see in full. Granting SELECT directly on
-- these base tables would let a client bypass that masking entirely.

-- ============================================================================
-- Client-facing masking views
-- ============================================================================
-- Views run with their OWNER's privileges by default, and the base tables
-- above have no grant to authenticated/anon at all — precisely so a client
-- cannot bypass a view to read a masked column directly. That also means
-- the base tables' RLS row policies are NOT relied on for filtering here:
-- an owner that happens to be a superuser bypasses RLS entirely regardless
-- of FORCE ROW LEVEL SECURITY. Each view therefore does its own explicit
-- row filtering against `auth.uid()` (which reflects the calling request's
-- JWT regardless of which role executes the query), so correctness never
-- depends on the view owner's RLS-bypass status.

create view public.games_public as
select
  g.id, g.status, g.mode, g.rules_version, g.language, g.dictionary, g.dictionary_version,
  g.board_config_id, g.tile_config_id, g.tempo, g.turn_duration_hours, g.board_state,
  jsonb_array_length(g.tile_bag) as tile_bag_remaining,
  g.current_turn_player_id, g.turn_version, g.turn_started_at, g.scoreless_turn_count,
  g.end_reason, g.created_by, g.created_at, g.started_at, g.completed_at
from public.games g
where exists (
  select 1 from public.game_players gp
  where gp.game_id = g.id and gp.player_id = auth.uid()
);
-- Note: `tile_bag` itself is never selected here (GAME_RULES.md section 74).

create view public.game_players_public as
select
  gp.game_id, gp.player_id, gp.status,
  case when gp.player_id = auth.uid() then gp.rack else null end as rack,
  jsonb_array_length(gp.rack) as rack_tile_count,
  gp.score, gp.turn_order, gp.has_resigned, gp.joined_at
from public.game_players gp
where exists (
  select 1 from public.game_players self
  where self.game_id = gp.game_id and self.player_id = auth.uid()
);

create view public.moves_public as
select
  m.id, m.game_id, m.move_number, m.player_id, m.action_type, m.client_move_id,
  m.placements, m.words_created, m.score, m.sjua_bonus,
  case when m.player_id = auth.uid() then m.swapped_tile_ids else null end as swapped_tile_ids,
  m.committed_at
from public.moves m
where exists (
  select 1 from public.game_players gp
  where gp.game_id = m.game_id and gp.player_id = auth.uid()
);

grant select on public.games_public, public.game_players_public, public.moves_public to authenticated;

-- Convenience view backing the future Home screen's "YOUR TURN" / "WAITING"
-- grouping (MASTER_PRODUCT_BRIEF.md section 22) — no UI built against this yet.
create view public.my_games as
select
  g.*,
  (g.status = 'active' and g.current_turn_player_id = auth.uid()) as is_my_turn
from public.games_public g
join public.game_players_public gp on gp.game_id = g.id
where gp.player_id = auth.uid();

grant select on public.my_games to authenticated;
