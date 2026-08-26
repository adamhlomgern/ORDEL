import { describe, expect, it } from 'vitest';
import type { GamePlayer, GameState, RackTile } from '@ordel/types';
import { applyPass, applyResign, applySwap } from './turnActions';

function tile(id: string): RackTile {
  return { id, kind: 'letter', letter: 'A' as never, value: 1 };
}

function player(playerId: string, rack: RackTile[] = []): GamePlayer {
  return { playerId, rack, score: 0, turnOrder: 0, hasResigned: false };
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
    players: [player('alice'), player('bob')],
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

describe('applyPass', () => {
  it('increments the scoreless counter and advances the turn to the other player', () => {
    const game = baseGame();
    const result = applyPass(game);
    expect(result.scorelessTurnCount).toBe(1);
    expect(result.currentTurnPlayerId).toBe('bob');
  });
});

describe('applySwap', () => {
  it('rejects an unknown acting player', () => {
    const game = baseGame();
    const result = applySwap(game, 'nobody', []);
    expect(result.valid).toBe(false);
  });

  it('updates the acting player’s rack and advances the turn on success', () => {
    const rackTile = tile('r1');
    const game = baseGame({
      players: [player('alice', [rackTile]), player('bob')],
      tileBag: Array.from({ length: 7 }, (_, i) => tile(`b${i}`)),
    });
    const result = applySwap(game, 'alice', [rackTile.id], () => 0);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.gameState.currentTurnPlayerId).toBe('bob');
      expect(result.gameState.scorelessTurnCount).toBe(1);
    }
  });
});

describe('applyResign', () => {
  it('ends the game and marks the resigning player', () => {
    const game = baseGame();
    const result = applyResign(game, 'bob');
    expect(result.status).toBe('completed');
    expect(result.endReason).toBe('resignation');
    expect(result.players.find((p) => p.playerId === 'bob')?.hasResigned).toBe(true);
    expect(result.players.find((p) => p.playerId === 'alice')?.hasResigned).toBe(false);
  });
});
