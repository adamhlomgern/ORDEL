import type {
  BoardTileState,
  GameEndReason,
  GamePlayer,
  GameState,
  GameStatus,
  RackTile,
  Tempo,
} from '@ordel/types';

/** Raw shape of a `public.games` row (service-role read, bypasses the masking views). */
export interface GameRow {
  id: string;
  status: GameStatus;
  mode: 'classic';
  rules_version: string;
  language: string;
  dictionary: string;
  dictionary_version: string;
  board_config_id: string;
  tile_config_id: string;
  tempo: Tempo;
  turn_duration_hours: number | null;
  board_state: BoardTileState[];
  tile_bag: RackTile[];
  current_turn_player_id: string | null;
  turn_version: number;
  scoreless_turn_count: number;
  end_reason: GameEndReason;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

/** Raw shape of a `public.game_players` row. */
export interface GamePlayerRow {
  game_id: string;
  player_id: string;
  status: 'invited' | 'accepted';
  rack: RackTile[];
  score: number;
  turn_order: number;
  has_resigned: boolean;
}

/** Reconstructs the engine's `GameState` from the raw authoritative DB rows. */
export function toGameState(game: GameRow, players: GamePlayerRow[]): GameState {
  return {
    id: game.id,
    status: game.status,
    config: {
      mode: game.mode,
      rulesVersion: game.rules_version,
      language: game.language,
      dictionary: game.dictionary,
      dictionaryVersion: game.dictionary_version,
      boardConfigId: game.board_config_id,
      tileConfigId: game.tile_config_id,
      tempo: game.tempo,
      turnDurationHours: game.turn_duration_hours,
    },
    board: game.board_state,
    players: players
      .slice()
      .sort((a, b) => a.turn_order - b.turn_order)
      .map((p): GamePlayer => ({
        playerId: p.player_id,
        rack: p.rack,
        score: p.score,
        turnOrder: p.turn_order,
        hasResigned: p.has_resigned,
      })),
    currentTurnPlayerId: game.current_turn_player_id,
    tileBag: game.tile_bag,
    scorelessTurnCount: game.scoreless_turn_count,
    endReason: game.end_reason,
    createdAt: game.created_at,
    startedAt: game.started_at,
    completedAt: game.completed_at,
  };
}

/** The subset of a resulting `GameState` the `apply_move_result` RPC needs to persist. */
export interface ResultingStateParams {
  boardState: BoardTileState[];
  tileBag: RackTile[];
  nextTurnPlayerId: string | null;
  scorelessTurnCount: number;
  status: GameStatus;
  endReason: GameEndReason;
  players: { playerId: string; rack: RackTile[]; score: number; hasResigned: boolean }[];
}

export function fromResultingState(state: GameState): ResultingStateParams {
  return {
    boardState: state.board,
    tileBag: state.tileBag,
    nextTurnPlayerId: state.currentTurnPlayerId,
    scorelessTurnCount: state.scorelessTurnCount,
    status: state.status,
    endReason: state.endReason,
    players: state.players.map((p) => ({
      playerId: p.playerId,
      rack: p.rack,
      score: p.score,
      hasResigned: p.hasResigned,
    })),
  };
}
