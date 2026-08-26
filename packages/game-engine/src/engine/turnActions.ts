import type { GamePlayer, GameState } from '@ordel/types';
import { swapTiles, type RandomSource } from './tileBag';

function nextPlayerId(gameState: GameState): string | null {
  const currentIndex = gameState.players.findIndex(
    (p) => p.playerId === gameState.currentTurnPlayerId,
  );
  if (currentIndex === -1) return gameState.currentTurnPlayerId;
  const next = gameState.players[(currentIndex + 1) % gameState.players.length];
  return next ? next.playerId : gameState.currentTurnPlayerId;
}

/** PASS: scores 0, does not alter the rack, consumes the turn (GAME_RULES.md section 42). */
export function applyPass(gameState: GameState): GameState {
  return {
    ...gameState,
    scorelessTurnCount: gameState.scorelessTurnCount + 1,
    currentTurnPlayerId: nextPlayerId(gameState),
  };
}

export type SwapActionResult =
  { valid: true; gameState: GameState } | { valid: false; reason: string };

/** SWAP: exchanges 1-7 rack tiles, requires >= 7 tiles in the bag (GAME_RULES.md section 43). */
export function applySwap(
  gameState: GameState,
  actingPlayerId: string,
  tileIds: string[],
  rng?: RandomSource,
): SwapActionResult {
  const player = gameState.players.find((p) => p.playerId === actingPlayerId);
  if (!player) {
    return { valid: false, reason: 'Acting player is not part of this game.' };
  }

  const result = swapTiles(player.rack, gameState.tileBag, tileIds, rng);
  if (!result.ok) {
    return { valid: false, reason: result.reason };
  }

  const updatedPlayers: GamePlayer[] = gameState.players.map((p) =>
    p.playerId === actingPlayerId ? { ...p, rack: result.rack } : p,
  );

  return {
    valid: true,
    gameState: {
      ...gameState,
      players: updatedPlayers,
      tileBag: result.bag,
      scorelessTurnCount: gameState.scorelessTurnCount + 1,
      currentTurnPlayerId: nextPlayerId(gameState),
    },
  };
}

/**
 * RESIGN: allowed even outside the resigning player's turn (GAME_RULES.md
 * section 45). Ends the game immediately; the board score is preserved
 * as-is (section 55) — no artificial score adjustment.
 */
export function applyResign(gameState: GameState, resigningPlayerId: string): GameState {
  return {
    ...gameState,
    status: 'completed',
    endReason: 'resignation',
    completedAt: new Date().toISOString(),
    players: gameState.players.map((p) =>
      p.playerId === resigningPlayerId ? { ...p, hasResigned: true } : p,
    ),
  };
}
