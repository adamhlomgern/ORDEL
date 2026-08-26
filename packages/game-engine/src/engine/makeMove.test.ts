import { describe, expect, it } from 'vitest';
import { InMemoryDictionaryProvider } from '@ordel/dictionary';
import type { GamePlayer, GameState, Letter, RackTile } from '@ordel/types';
import { makeMove } from './makeMove';
import { ORDEL_CLASSIC_BOARD_1 } from '../board/classicBoard';
import { ORDEL_SV_TILES_1 } from '../tiles/svClassicTiles';
import type { MoveResult } from '@ordel/types';

const dictionary = new InMemoryDictionaryProvider();

/** Unwraps a valid MoveResult's resulting state, failing the test loudly if the move was rejected. */
function unwrap(result: MoveResult): GameState {
  if (!result.valid) {
    throw new Error(`Expected a valid move but got: ${result.reason}`);
  }
  return result.resultingGameState;
}

let nextTileId = 0;
function letterTile(letter: Letter, value = 1): RackTile {
  nextTileId += 1;
  return { id: `t${nextTileId}`, kind: 'letter', letter, value };
}

function blankTile(assignedLetter: Letter | null = null): RackTile {
  nextTileId += 1;
  return { id: `t${nextTileId}`, kind: 'blank', assignedLetter, value: 0 };
}

function player(playerId: string, rack: RackTile[], turnOrder: number): GamePlayer {
  return { playerId, rack, score: 0, turnOrder, hasResigned: false };
}

function freshGame(overrides: Partial<GameState> = {}): GameState {
  return {
    id: 'game-1',
    status: 'active',
    config: {
      mode: 'classic',
      rulesVersion: 'classic-1.0.0',
      language: 'sv-SE',
      dictionary: 'ordel-sv',
      dictionaryVersion: dictionary.getDictionaryVersion(),
      boardConfigId: ORDEL_CLASSIC_BOARD_1.id,
      tileConfigId: ORDEL_SV_TILES_1.id,
      tempo: 'NORMAL',
      turnDurationHours: 72,
    },
    board: [],
    players: [player('alice', [], 0), player('bob', [], 1)],
    currentTurnPlayerId: 'alice',
    tileBag: [],
    scorelessTurnCount: 0,
    endReason: null,
    createdAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    completedAt: null,
    ...overrides,
  };
}

describe('makeMove — turn and status guards', () => {
  it('rejects a move on a non-active game', () => {
    const game = freshGame({ status: 'completed' });
    const result = makeMove(game, { type: 'PASS' }, 'alice', dictionary);
    expect(result.valid).toBe(false);
  });

  it('rejects a move from a player who is not the current turn', () => {
    const game = freshGame();
    const result = makeMove(game, { type: 'PASS' }, 'bob', dictionary);
    expect(result.valid).toBe(false);
  });

  it('allows RESIGN even when it is not the resigning player’s turn', () => {
    const game = freshGame({ currentTurnPlayerId: 'alice' });
    const result = makeMove(game, { type: 'RESIGN' }, 'bob', dictionary);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.resultingGameState.status).toBe('completed');
      expect(result.resultingGameState.endReason).toBe('resignation');
      expect(result.resultingGameState.players.find((p) => p.playerId === 'bob')?.hasResigned).toBe(
        true,
      );
    }
  });
});

describe('makeMove — first move through center', () => {
  it('rejects a first move that does not cover the center cell', () => {
    const rack = [letterTile('B', 4), letterTile('I', 1), letterTile('L', 1)];
    const game = freshGame({ players: [player('alice', rack, 0), player('bob', [], 1)] });
    const result = makeMove(
      game,
      {
        type: 'PLAY',
        placements: [
          { coordinate: { row: 0, col: 0 }, tile: rack[0]! },
          { coordinate: { row: 0, col: 1 }, tile: rack[1]! },
          { coordinate: { row: 0, col: 2 }, tile: rack[2]! },
        ],
      },
      'alice',
      dictionary,
    );
    expect(result.valid).toBe(false);
  });

  it('accepts a valid first move covering the center cell and scores it', () => {
    const rack = [letterTile('B', 4), letterTile('I', 1), letterTile('L', 1)];
    const game = freshGame({ players: [player('alice', rack, 0), player('bob', [], 1)] });
    const result = makeMove(
      game,
      {
        type: 'PLAY',
        placements: [
          { coordinate: { row: 7, col: 6 }, tile: rack[0]! },
          { coordinate: { row: 7, col: 7 }, tile: rack[1]! },
          { coordinate: { row: 7, col: 8 }, tile: rack[2]! },
        ],
      },
      'alice',
      dictionary,
    );
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.wordsCreated).toHaveLength(1);
      expect(result.wordsCreated[0]!.word).toBe('BIL');
      // Center cell (H8) has no multiplier; B=4, I=1, L=1 = 6.
      expect(result.score).toBe(6);
      expect(result.resultingGameState.board).toHaveLength(3);
      expect(result.resultingGameState.currentTurnPlayerId).toBe('bob');
      expect(result.resultingGameState.scorelessTurnCount).toBe(0);
    }
  });

  it('rejects a placement that forms no valid dictionary word', () => {
    const rack = [letterTile('Z', 10), letterTile('X', 8), letterTile('Q', 10)];
    const game = freshGame({ players: [player('alice', rack, 0), player('bob', [], 1)] });
    const result = makeMove(
      game,
      {
        type: 'PLAY',
        placements: [
          { coordinate: { row: 7, col: 7 }, tile: rack[0]! },
          { coordinate: { row: 7, col: 8 }, tile: rack[1]! },
          { coordinate: { row: 7, col: 9 }, tile: rack[2]! },
        ],
      },
      'alice',
      dictionary,
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain('ZXQ');
    }
  });
});

describe('makeMove — connectivity after the first move', () => {
  function gameWithBil(): GameState {
    return freshGame({
      board: [
        { coordinate: { row: 7, col: 6 }, letter: 'B', isBlank: false, bonusConsumed: false },
        { coordinate: { row: 7, col: 7 }, letter: 'I', isBlank: false, bonusConsumed: false },
        { coordinate: { row: 7, col: 8 }, letter: 'L', isBlank: false, bonusConsumed: false },
      ],
      currentTurnPlayerId: 'bob',
    });
  }

  it('rejects a disconnected second move', () => {
    const rack = [letterTile('K', 2), letterTile('A', 1), letterTile('T', 1), letterTile('T', 1)];
    const game = gameWithBil();
    game.players = [player('alice', [], 0), player('bob', rack, 1)];
    const result = makeMove(
      game,
      {
        type: 'PLAY',
        placements: [
          { coordinate: { row: 0, col: 0 }, tile: rack[0]! },
          { coordinate: { row: 0, col: 1 }, tile: rack[1]! },
        ],
      },
      'bob',
      dictionary,
    );
    expect(result.valid).toBe(false);
  });

  it('accepts a word that extends downward from an existing tile', () => {
    // Existing: B I L at row7 col6-8. Extend the I at (7,7) downward with K,E,A to spell IKEA.
    const rack = [letterTile('K', 2), letterTile('E', 1), letterTile('A', 1)];
    const game = gameWithBil();
    game.players = [player('alice', [], 0), player('bob', rack, 1)];
    const result = makeMove(
      game,
      {
        type: 'PLAY',
        placements: [
          { coordinate: { row: 8, col: 7 }, tile: rack[0]! },
          { coordinate: { row: 9, col: 7 }, tile: rack[1]! },
          { coordinate: { row: 10, col: 7 }, tile: rack[2]! },
        ],
      },
      'bob',
      dictionary,
    );
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.wordsCreated.map((w) => w.word)).toEqual(['IKEA']);
    }
  });
});

describe('makeMove — blank tiles', () => {
  it('scores a blank tile as 0 points regardless of its assigned letter', () => {
    const rack = [letterTile('B', 4), blankTile('I'), letterTile('L', 1)];
    const game = freshGame({ players: [player('alice', rack, 0), player('bob', [], 1)] });
    const result = makeMove(
      game,
      {
        type: 'PLAY',
        placements: [
          { coordinate: { row: 7, col: 6 }, tile: rack[0]! },
          { coordinate: { row: 7, col: 7 }, tile: rack[1]! },
          { coordinate: { row: 7, col: 8 }, tile: rack[2]! },
        ],
      },
      'alice',
      dictionary,
    );
    expect(result.valid).toBe(true);
    if (result.valid) {
      // B=4, blank-I=0, L=1 = 5 (vs 6 if the blank scored normally).
      expect(result.score).toBe(5);
    }
  });
});

describe('makeMove — SJUA bonus', () => {
  it('grants +50 when all seven rack tiles are played in one move (SVERIGE)', () => {
    const letters: [Letter, number][] = [
      ['S', 1],
      ['V', 3],
      ['E', 1],
      ['R', 1],
      ['I', 1],
      ['G', 2],
      ['E', 1],
    ];
    const rack = letters.map(([letter, value]) => letterTile(letter, value));
    const game = freshGame({ players: [player('alice', rack, 0), player('bob', [], 1)] });

    // Row 7, columns 4-10: S V E R I G E — column 7 (the 4th tile, "R") covers the center.
    const result = makeMove(
      game,
      {
        type: 'PLAY',
        placements: rack.map((tile, index) => ({
          coordinate: { row: 7, col: 4 + index },
          tile,
        })),
      },
      'alice',
      dictionary,
    );

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.wordsCreated.map((w) => w.word)).toEqual(['SVERIGE']);
      expect(result.sjuaBonus).toBe(true);
      expect(result.score).toBeGreaterThan(50);
    }
  });

  it('does not grant SJUA for a shrunk end-game rack, even if fully played', () => {
    const rack = [letterTile('B', 4), letterTile('I', 1), letterTile('L', 1)];
    const game = freshGame({
      players: [player('alice', rack, 0), player('bob', [], 1)],
      tileBag: [],
    });
    const result = makeMove(
      game,
      {
        type: 'PLAY',
        placements: [
          { coordinate: { row: 7, col: 6 }, tile: rack[0]! },
          { coordinate: { row: 7, col: 7 }, tile: rack[1]! },
          { coordinate: { row: 7, col: 8 }, tile: rack[2]! },
        ],
      },
      'alice',
      dictionary,
    );
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.sjuaBonus).toBe(false);
    }
  });
});

describe('makeMove — PASS and SWAP', () => {
  it('PASS increments the scoreless counter and advances the turn', () => {
    const game = freshGame();
    const result = makeMove(game, { type: 'PASS' }, 'alice', dictionary);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.resultingGameState.scorelessTurnCount).toBe(1);
      expect(result.resultingGameState.currentTurnPlayerId).toBe('bob');
    }
  });

  it('SWAP is rejected when the bag has fewer than 7 tiles', () => {
    const rack = [letterTile('A', 1)];
    const game = freshGame({
      players: [player('alice', rack, 0), player('bob', [], 1)],
      tileBag: [letterTile('E', 1)],
    });
    const result = makeMove(game, { type: 'SWAP', tileIds: [rack[0]!.id] }, 'alice', dictionary);
    expect(result.valid).toBe(false);
  });

  it('four consecutive scoreless turns end the game with each player deducting their own rack', () => {
    const aliceRack = [letterTile('A', 1), letterTile('B', 4)];
    const bobRack = [letterTile('C', 8)];
    let game = freshGame({ players: [player('alice', aliceRack, 0), player('bob', bobRack, 1)] });

    game = unwrap(makeMove(game, { type: 'PASS' }, 'alice', dictionary));
    game = unwrap(makeMove(game, { type: 'PASS' }, 'bob', dictionary));
    game = unwrap(makeMove(game, { type: 'PASS' }, 'alice', dictionary));

    const fourth = makeMove(game, { type: 'PASS' }, 'bob', dictionary);
    expect(fourth.valid).toBe(true);
    if (fourth.valid) {
      const final = fourth.resultingGameState;
      expect(final.status).toBe('completed');
      expect(final.endReason).toBe('scoreless_turns');
      expect(final.players.find((p) => p.playerId === 'alice')?.score).toBe(-5);
      expect(final.players.find((p) => p.playerId === 'bob')?.score).toBe(-8);
    }
  });
});
