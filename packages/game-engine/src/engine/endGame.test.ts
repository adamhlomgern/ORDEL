import { describe, expect, it } from 'vitest';
import type { GamePlayer, GameState, RackTile } from '@ordel/types';
import { applyEndGameConditions } from './endGame';

function tile(id: string, value: number): RackTile {
  return { id, kind: 'letter', letter: 'A' as never, value };
}

function player(playerId: string, rack: RackTile[], score = 0): GamePlayer {
  return { playerId, rack, score, turnOrder: 0, hasResigned: false };
}

function baseGame(overrides: Partial<GameState> = {}): GameState {
  return {
    id: 'g1',
    status: 'active',
    config: {
      mode: 'classic',
      rulesVersion: 'classic-1.0.0',
      language: 'sv-SE',
      dictionary: 'ordel-sv',
      dictionaryVersion: '1',
      boardConfigId: 'ordel-classic-board-1',
      tileConfigId: 'ordel-sv-tiles-1',
      tempo: 'NORMAL',
      turnDurationHours: 72,
    },
    board: [],
    players: [player('alice', []), player('bob', [])],
    currentTurnPlayerId: 'alice',
    tileBag: [],
    scorelessTurnCount: 0,
    endReason: null,
    createdAt: '',
    startedAt: '',
    completedAt: null,
    ...overrides,
  };
}

describe('applyEndGameConditions', () => {
  it('leaves an active game unchanged when no end condition is met', () => {
    const game = baseGame({ tileBag: [tile('b1', 1)] });
    const result = applyEndGameConditions(game, 'alice');
    expect(result.status).toBe('active');
  });

  it('played-out: the player who empties their rack gains the opponent’s remaining rack value', () => {
    const game = baseGame({
      players: [player('alice', []), player('bob', [tile('b1', 3), tile('b2', 4)])],
      tileBag: [],
    });
    const result = applyEndGameConditions(game, 'alice');
    expect(result.status).toBe('completed');
    expect(result.endReason).toBe('played_out');
    expect(result.players.find((p) => p.playerId === 'alice')?.score).toBe(7);
    expect(result.players.find((p) => p.playerId === 'bob')?.score).toBe(-7);
  });

  it('scoreless end: each player deducts only their own remaining rack value, no transfer', () => {
    const game = baseGame({
      scorelessTurnCount: 4,
      players: [player('alice', [tile('a1', 2)], 10), player('bob', [tile('b1', 5)], 20)],
    });
    const result = applyEndGameConditions(game, 'alice');
    expect(result.status).toBe('completed');
    expect(result.endReason).toBe('scoreless_turns');
    expect(result.players.find((p) => p.playerId === 'alice')?.score).toBe(8);
    expect(result.players.find((p) => p.playerId === 'bob')?.score).toBe(15);
  });

  it('does not trigger played-out just because the bag is empty if the mover still has tiles', () => {
    const game = baseGame({
      players: [player('alice', [tile('a1', 1)]), player('bob', [])],
      tileBag: [],
    });
    const result = applyEndGameConditions(game, 'alice');
    expect(result.status).toBe('active');
  });
});
