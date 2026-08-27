import { createClient } from '@supabase/supabase-js';
import { InMemoryDictionaryProvider } from '@ordel/dictionary';
import { makeMove } from '@ordel/game-engine';
import type { ProposedMove } from '@ordel/types';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { secureRandom } from '../_shared/secureRandom.ts';
import {
  fromResultingState,
  toGameState,
  type GamePlayerRow,
  type GameRow,
} from '../_shared/gameState.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const STALE_STATE_ERRCODE = '40001';

interface SubmitTurnActionBody {
  gameId?: string;
  clientMoveId?: string;
  action?: ProposedMove;
}

interface MoveRow {
  id: string;
  move_number: number;
  score: number;
  words_created: unknown;
  sjua_bonus: boolean;
}

interface ApplyMoveResultRow {
  move_id: string;
  move_number: number;
  score: number;
  words_created: unknown;
  sjua_bonus: boolean;
  duplicate: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing Authorization header.' }, 401);
  }

  const asUser = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await asUser.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse({ error: 'Invalid session.' }, 401);
  }
  const actingPlayerId = userData.user.id;

  let body: SubmitTurnActionBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body.' }, 400);
  }

  const { gameId, clientMoveId, action } = body;
  if (!gameId || !clientMoveId || !action) {
    return jsonResponse({ error: 'gameId, clientMoveId and action are required.' }, 400);
  }

  const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Idempotency: never re-run the engine against what could by now be stale
  // state for a submission already committed (GAME_RULES.md section 62).
  const { data: existingMove } = await service
    .from('moves')
    .select('id, move_number, score, words_created, sjua_bonus')
    .eq('game_id', gameId)
    .eq('player_id', actingPlayerId)
    .eq('client_move_id', clientMoveId)
    .maybeSingle<MoveRow>();

  if (existingMove) {
    return jsonResponse(
      {
        duplicate: true,
        moveId: existingMove.id,
        moveNumber: existingMove.move_number,
        score: existingMove.score,
        wordsCreated: existingMove.words_created,
        sjuaBonus: existingMove.sjua_bonus,
      },
      200,
    );
  }

  const { data: gameRow, error: gameError } = await service
    .from('games')
    .select('*')
    .eq('id', gameId)
    .maybeSingle<GameRow>();

  if (gameError) {
    return jsonResponse({ error: gameError.message }, 500);
  }
  if (!gameRow) {
    return jsonResponse({ error: 'Game not found.' }, 404);
  }

  const { data: playerRows, error: playersError } = await service
    .from('game_players')
    .select('*')
    .eq('game_id', gameId)
    .returns<GamePlayerRow[]>();

  if (playersError) {
    return jsonResponse({ error: playersError.message }, 500);
  }
  if (!playerRows?.some((p) => p.player_id === actingPlayerId)) {
    return jsonResponse({ error: 'You are not a participant in this game.' }, 403);
  }

  const gameState = toGameState(gameRow, playerRows);
  const dictionary = new InMemoryDictionaryProvider();
  const result = makeMove(gameState, action, actingPlayerId, dictionary, secureRandom);

  if (!result.valid) {
    return jsonResponse({ error: result.reason }, 400);
  }

  const resulting = fromResultingState(result.resultingGameState);

  const { data: rpcRows, error: rpcError } = await service.rpc('apply_move_result', {
    p_game_id: gameId,
    p_acting_player_id: actingPlayerId,
    p_client_move_id: clientMoveId,
    p_expected_turn_version: gameRow.turn_version,
    p_action_type: action.type,
    p_placements: action.type === 'PLAY' ? action.placements : null,
    p_words_created: result.wordsCreated,
    p_score: result.score,
    p_sjua_bonus: result.sjuaBonus,
    p_swapped_tile_ids: action.type === 'SWAP' ? action.tileIds : null,
    p_board_state: resulting.boardState,
    p_tile_bag: resulting.tileBag,
    p_players: resulting.players,
    p_next_turn_player_id: resulting.nextTurnPlayerId,
    p_scoreless_turn_count: resulting.scorelessTurnCount,
    p_status: resulting.status,
    p_end_reason: resulting.endReason,
  });

  if (rpcError) {
    if (rpcError.code === STALE_STATE_ERRCODE) {
      // Every error response here uses `error` as the human-readable
      // message (never a separate machine code) — keep this one consistent
      // with the rest rather than special-casing it.
      return jsonResponse({ error: 'Game state changed, please refresh and retry.' }, 409);
    }
    return jsonResponse({ error: rpcError.message }, 500);
  }

  const [row] = (rpcRows ?? []) as ApplyMoveResultRow[];
  return jsonResponse(
    {
      duplicate: row.duplicate,
      moveId: row.move_id,
      moveNumber: row.move_number,
      score: row.score,
      wordsCreated: row.words_created,
      sjuaBonus: row.sjua_bonus,
    },
    200,
  );
});
