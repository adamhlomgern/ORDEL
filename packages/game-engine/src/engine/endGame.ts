import type { GamePlayer, GameState, Rack } from '@ordel/types';

const SCORELESS_TURN_LIMIT = 4;

function rackValue(rack: Rack): number {
  return rack.reduce((sum, tile) => sum + tile.value, 0);
}

/**
 * Checks and applies the two automatic end conditions (GAME_RULES.md
 * sections 44, 51-54) after a committed PLAY/PASS/SWAP. Must run *after*
 * the mover's rack/bag/scoreless-counter updates are already reflected in
 * `gameState`. Returns the game unchanged if neither condition is met.
 */
export function applyEndGameConditions(gameState: GameState, moverPlayerId: string): GameState {
  const mover = gameState.players.find((p) => p.playerId === moverPlayerId);

  if (mover && gameState.tileBag.length === 0 && mover.rack.length === 0) {
    return applyPlayedOut(gameState, moverPlayerId);
  }

  if (gameState.scorelessTurnCount >= SCORELESS_TURN_LIMIT) {
    return applyScorelessEnd(gameState);
  }

  return gameState;
}

/** The player who empties their rack while the bag is empty gains the opponent's remaining rack value (section 53). */
function applyPlayedOut(gameState: GameState, moverPlayerId: string): GameState {
  const players: GamePlayer[] = gameState.players.map((player) => {
    if (player.playerId === moverPlayerId) return player;
    const deduction = rackValue(player.rack);
    return { ...player, score: player.score - deduction };
  });

  const totalDeducted = gameState.players
    .filter((p) => p.playerId !== moverPlayerId)
    .reduce((sum, p) => sum + rackValue(p.rack), 0);

  const finalPlayers = players.map((player) =>
    player.playerId === moverPlayerId ? { ...player, score: player.score + totalDeducted } : player,
  );

  return {
    ...gameState,
    players: finalPlayers,
    status: 'completed',
    endReason: 'played_out',
    completedAt: new Date().toISOString(),
  };
}

/** Each player's own remaining rack value is deducted from their own score — no transfer (section 54). */
function applyScorelessEnd(gameState: GameState): GameState {
  const players: GamePlayer[] = gameState.players.map((player) => ({
    ...player,
    score: player.score - rackValue(player.rack),
  }));

  return {
    ...gameState,
    players,
    status: 'completed',
    endReason: 'scoreless_turns',
    completedAt: new Date().toISOString(),
  };
}
