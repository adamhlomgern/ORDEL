import { createClient } from '@supabase/supabase-js';
import { DEV_DICTIONARY_VERSION } from '@ordel/dictionary';
import {
  ORDEL_CLASSIC_BOARD_1,
  ORDEL_SV_TILES_1,
  buildInitialTileBag,
  drawTiles,
} from '@ordel/game-engine';
import type { Tempo } from '@ordel/types';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { secureRandom } from '../_shared/secureRandom.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/** GAME_RULES.md section 46: LUGN=168h, NORMAL=72h (default), SNABB=24h, INGEN GRÄNS=no limit. */
const TEMPO_HOURS: Record<Tempo, number | null> = {
  LUGN: 168,
  NORMAL: 72,
  SNABB: 24,
  'INGEN GRÄNS': null,
};

interface CreateGameBody {
  opponentUsername?: string;
  tempo?: string;
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
  const creatorId = userData.user.id;

  let body: CreateGameBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body.' }, 400);
  }

  const opponentUsername = body.opponentUsername?.trim();
  if (!opponentUsername) {
    return jsonResponse({ error: 'opponentUsername is required.' }, 400);
  }

  const tempo = (body.tempo ?? 'NORMAL') as Tempo;
  if (!(tempo in TEMPO_HOURS)) {
    return jsonResponse({ error: `Invalid tempo: ${body.tempo}` }, 400);
  }

  const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: opponent, error: opponentError } = await service
    .from('profiles')
    .select('id')
    .eq('username', opponentUsername)
    .maybeSingle();

  if (opponentError) {
    return jsonResponse({ error: opponentError.message }, 500);
  }
  if (!opponent) {
    return jsonResponse({ error: 'Opponent not found.' }, 404);
  }
  if (opponent.id === creatorId) {
    return jsonResponse({ error: 'Cannot create a game against yourself.' }, 400);
  }

  const shuffledBag = buildInitialTileBag(ORDEL_SV_TILES_1, secureRandom);
  const { drawn: creatorRack, remainingBag: bagAfterCreator } = drawTiles(
    shuffledBag,
    7,
    secureRandom,
  );
  const { drawn: opponentRack, remainingBag: finalBag } = drawTiles(
    bagAfterCreator,
    7,
    secureRandom,
  );

  const creatorGoesFirst = secureRandom() < 0.5;
  const firstPlayerId = creatorGoesFirst ? creatorId : opponent.id;

  const { data: gameId, error: rpcError } = await service.rpc('create_classic_game', {
    p_creator_id: creatorId,
    p_opponent_id: opponent.id,
    p_tempo: tempo,
    p_turn_duration_hours: TEMPO_HOURS[tempo],
    p_rules_version: 'classic-1.0.0',
    p_language: 'sv-SE',
    p_dictionary: 'ordel-sv-dev',
    p_dictionary_version: DEV_DICTIONARY_VERSION,
    p_board_config_id: ORDEL_CLASSIC_BOARD_1.id,
    p_tile_config_id: ORDEL_SV_TILES_1.id,
    p_board_state: [],
    p_tile_bag: finalBag,
    p_first_player_id: firstPlayerId,
    p_creator_rack: creatorRack,
    p_opponent_rack: opponentRack,
    p_creator_turn_order: creatorGoesFirst ? 0 : 1,
    p_opponent_turn_order: creatorGoesFirst ? 1 : 0,
  });

  if (rpcError) {
    return jsonResponse({ error: rpcError.message }, 500);
  }

  return jsonResponse({ gameId }, 201);
});
