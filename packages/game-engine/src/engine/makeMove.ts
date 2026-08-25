import type { GameState, MoveResult, ProposedMove } from '@ordel/types';

/**
 * Validates and applies a proposed move against authoritative game state
 * (MASTER_PRODUCT_BRIEF.md section 11: `makeMove(gameState, proposedMove) -> MoveResult`).
 *
 * V0.0 STUB: only the server-authoritative signature is established here.
 * Full placement/connectivity/dictionary/scoring/SJUA logic per GAME_RULES.md
 * is implemented in V0.1 (MASTER_PRODUCT_BRIEF.md section 54).
 */
export function makeMove(_gameState: GameState, proposedMove: ProposedMove): MoveResult {
  if (proposedMove.type === 'PLAY' && proposedMove.placements.length === 0) {
    return { valid: false, reason: 'A PLAY move requires at least one placement.' };
  }

  return {
    valid: false,
    reason: 'Game engine rule implementation is not yet available (targeted for V0.1).',
  };
}
