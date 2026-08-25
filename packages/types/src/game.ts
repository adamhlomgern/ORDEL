import type { BoardCoordinate } from './board';
import type { Letter, Rack } from './tiles';

/**
 * Turn duration presets per GAME_RULES.md section 46. Kept as the exact
 * Swedish identifiers used in the rules document (see docs/DECISIONS.md) —
 * these are versioned domain configuration, not translatable UI copy.
 */
export type Tempo = 'LUGN' | 'NORMAL' | 'SNABB' | 'INGEN GRÄNS';

export type GameStatus = 'pending' | 'active' | 'completed';

export type GameEndReason = 'played_out' | 'scoreless_turns' | 'resignation' | 'timeout' | null;

/**
 * A tile committed to the board during gameplay. Distinct from the static
 * `BoardCell` bonus layout in ./board — this is per-game mutable state.
 */
export interface BoardTileState {
  coordinate: BoardCoordinate;
  letter: Letter;
  isBlank: boolean;
  bonusConsumed: boolean;
}

export interface GamePlayer {
  playerId: string;
  rack: Rack;
  score: number;
  turnOrder: number;
  hasResigned: boolean;
}

/**
 * The full, reproducible configuration of a Classic game
 * (GAME_RULES.md section 71). Locked at creation time — never mutated.
 */
export interface GameConfig {
  mode: 'classic';
  rulesVersion: string;
  language: string;
  dictionary: string;
  dictionaryVersion: string;
  boardConfigId: string;
  tileConfigId: string;
  tempo: Tempo;
  turnDurationHours: number | null;
}

export interface GameState {
  id: string;
  status: GameStatus;
  config: GameConfig;
  board: BoardTileState[];
  players: GamePlayer[];
  currentTurnPlayerId: string | null;
  tileBagRemaining: number;
  scorelessTurnCount: number;
  endReason: GameEndReason;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}
