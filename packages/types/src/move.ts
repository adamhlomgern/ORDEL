import type { BoardCoordinate } from './board';
import type { GameState } from './game';
import type { RackTile } from './tiles';

/** A single newly placed tile as part of a proposed PLAY move. */
export interface Placement {
  coordinate: BoardCoordinate;
  tile: RackTile;
}

/**
 * The four committed turn actions a player may take (GAME_RULES.md section 39).
 * TIMEOUT and GAME_END are not player-submitted moves but are recorded in
 * move history (GAME_RULES.md section 66).
 */
export type ActionType = 'PLAY' | 'PASS' | 'SWAP' | 'RESIGN' | 'TIMEOUT' | 'GAME_END';

export type ProposedMove =
  | { type: 'PLAY'; placements: Placement[] }
  | { type: 'PASS' }
  | { type: 'SWAP'; tileIds: string[] }
  | { type: 'RESIGN' };

export interface WordResult {
  word: string;
  score: number;
  coordinates: BoardCoordinate[];
}

export type MoveResult =
  | {
      valid: true;
      score: number;
      wordsCreated: WordResult[];
      sjuaBonus: boolean;
      resultingGameState: GameState;
    }
  | {
      valid: false;
      reason: string;
    };
