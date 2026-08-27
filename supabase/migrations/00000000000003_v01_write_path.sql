-- V0.1 Milestone C: the write path for games/game_players/moves.
--
-- Both functions are SECURITY DEFINER and executable only by `service_role`
-- (see the revoke/grant at the end of each). This is deliberately different
-- from the earlier SECURITY DEFINER views mistake documented in
-- docs/DECISIONS.md: those views were reachable by *any* authenticated
-- client and had to defend themselves with their own row filtering. These
-- functions are reachable only from the Edge Functions under
-- supabase/functions (create-game, submit-turn-action), which hold the
-- service-role key — never from a client directly — so running with
-- elevated privilege here is the intended access path, not a bypass of one.
--
-- All domain computation (shuffling the bag, dealing racks, running
-- @ordel/game-engine's makeMove()) happens in TypeScript before either
-- function is called. These functions are deliberately "dumb": they just
-- make a set of writes atomic and enforce the few invariants only the
-- database can guarantee (uniqueness, row locking).

-- ============================================================================
-- service_role grants for the Edge Functions' own direct reads.
-- ============================================================================
-- `service_role` bypasses RLS (BYPASSRLS) but that is orthogonal to table
-- grants in Postgres — bypassing a *policy* does not imply having the base
-- *privilege*. Migration 2 only granted select/insert on profiles to
-- `authenticated`; nothing was ever granted to `service_role`. The two
-- functions below are SECURITY DEFINER, so their INSERT/UPDATE statements
-- run as the function owner regardless of the caller's grants — but the
-- Edge Functions also do a few direct PostgREST reads (as service_role,
-- not through a function) before ever calling into them: looking up an
-- opponent by username, checking for an already-committed idempotent move,
-- and loading the current game/game_players state. Those need their own
-- explicit select grants.
grant select on public.profiles to service_role;
grant select on public.games to service_role;
grant select on public.game_players to service_role;
grant select on public.moves to service_role;

-- ============================================================================
-- create_classic_game: atomically inserts one games row + two game_players
-- rows. No separate invite/accept step exists yet (docs/DECISIONS.md) — both
-- players are inserted as 'accepted' and the game starts 'active'.
-- ============================================================================

create function public.create_classic_game(
  p_creator_id uuid,
  p_opponent_id uuid,
  p_tempo text,
  p_turn_duration_hours integer,
  p_rules_version text,
  p_language text,
  p_dictionary text,
  p_dictionary_version text,
  p_board_config_id text,
  p_tile_config_id text,
  p_board_state jsonb,
  p_tile_bag jsonb,
  p_first_player_id uuid,
  p_creator_rack jsonb,
  p_opponent_rack jsonb,
  p_creator_turn_order integer,
  p_opponent_turn_order integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game_id uuid;
begin
  insert into public.games (
    status, mode, rules_version, language, dictionary, dictionary_version,
    board_config_id, tile_config_id, tempo, turn_duration_hours,
    board_state, tile_bag, current_turn_player_id, started_at, created_by
  ) values (
    'active', 'classic', p_rules_version, p_language, p_dictionary, p_dictionary_version,
    p_board_config_id, p_tile_config_id, p_tempo, p_turn_duration_hours,
    p_board_state, p_tile_bag, p_first_player_id, now(), p_creator_id
  )
  returning id into v_game_id;

  insert into public.game_players (game_id, player_id, status, rack, turn_order, joined_at)
  values
    (v_game_id, p_creator_id, 'accepted', p_creator_rack, p_creator_turn_order, now()),
    (v_game_id, p_opponent_id, 'accepted', p_opponent_rack, p_opponent_turn_order, now());

  return v_game_id;
end;
$$;

revoke all on function public.create_classic_game from public;
revoke all on function public.create_classic_game from anon, authenticated;
grant execute on function public.create_classic_game to service_role;

-- ============================================================================
-- apply_move_result: persists one already-validated move (GAME_RULES.md
-- section 61, "a partial move must never be persisted") with:
--   - idempotency (section 62): a duplicate (game_id, player_id,
--     client_move_id) returns the ORIGINALLY committed result instead of
--     applying anything twice.
--   - optimistic concurrency (section 72): the caller passes the
--     turn_version it read; a mismatch (another move landed first) raises
--     serialization_failure (40001) instead of silently overwriting.
-- ============================================================================

create function public.apply_move_result(
  p_game_id uuid,
  p_acting_player_id uuid,
  p_client_move_id uuid,
  p_expected_turn_version integer,
  p_action_type text,
  p_placements jsonb,
  p_words_created jsonb,
  p_score integer,
  p_sjua_bonus boolean,
  p_swapped_tile_ids jsonb,
  p_board_state jsonb,
  p_tile_bag jsonb,
  p_players jsonb,
  p_next_turn_player_id uuid,
  p_scoreless_turn_count integer,
  p_status text,
  p_end_reason text
)
returns table (
  move_id uuid,
  move_number integer,
  score integer,
  words_created jsonb,
  sjua_bonus boolean,
  duplicate boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_version integer;
  v_move_number integer;
  v_new_move_id uuid;
  v_player jsonb;
begin
  -- Idempotency pre-check: has this exact submission already been committed?
  -- (The Edge Function also checks this before running the engine at all —
  -- this is the race-safe second layer for two near-simultaneous retries.)
  return query
    select m.id, m.move_number, m.score, m.words_created, m.sjua_bonus, true
    from public.moves m
    where m.game_id = p_game_id
      and m.player_id = p_acting_player_id
      and m.client_move_id = p_client_move_id;

  if found then
    return;
  end if;

  select g.turn_version into v_current_version
  from public.games g
  where g.id = p_game_id
  for update;

  if not found then
    raise exception 'game % not found', p_game_id using errcode = 'P0002';
  end if;

  if v_current_version <> p_expected_turn_version then
    raise exception 'stale turn_version: expected %, found %', p_expected_turn_version, v_current_version
      using errcode = '40001';
  end if;

  v_move_number := coalesce((select max(m.move_number) from public.moves m where m.game_id = p_game_id), 0) + 1;

  insert into public.moves (
    game_id, move_number, player_id, action_type, client_move_id,
    placements, words_created, score, sjua_bonus, swapped_tile_ids
  ) values (
    p_game_id, v_move_number, p_acting_player_id, p_action_type, p_client_move_id,
    p_placements, p_words_created, p_score, p_sjua_bonus, p_swapped_tile_ids
  )
  returning id into v_new_move_id;

  update public.games set
    board_state = p_board_state,
    tile_bag = p_tile_bag,
    current_turn_player_id = p_next_turn_player_id,
    turn_version = turn_version + 1,
    turn_started_at = case when p_status = 'active' then now() else turn_started_at end,
    scoreless_turn_count = p_scoreless_turn_count,
    status = p_status,
    end_reason = p_end_reason,
    completed_at = case when p_status = 'completed' then now() else null end
  where id = p_game_id;

  for v_player in select * from jsonb_array_elements(p_players)
  loop
    update public.game_players set
      rack = v_player -> 'rack',
      score = (v_player ->> 'score')::integer,
      has_resigned = (v_player ->> 'hasResigned')::boolean
    where game_id = p_game_id and player_id = (v_player ->> 'playerId')::uuid;
  end loop;

  return query select v_new_move_id, v_move_number, p_score, p_words_created, p_sjua_bonus, false;
end;
$$;

revoke all on function public.apply_move_result from public;
revoke all on function public.apply_move_result from anon, authenticated;
grant execute on function public.apply_move_result to service_role;
