import { describe, expect, it } from 'vitest';
import type { BoardTileState, GamePlayer, Placement, RackTile } from '@ordel/types';
import { checkPlacement } from './placement';
import { ORDEL_CLASSIC_BOARD_1 } from '../board/classicBoard';

function letterTile(id: string, letter = 'A'): RackTile {
  return { id, kind: 'letter', letter: letter as never, value: 1 };
}

function makePlayer(rack: RackTile[]): GamePlayer {
  return { playerId: 'p1', rack, score: 0, turnOrder: 0, hasResigned: false };
}

function placementAt(row: number, col: number, tile: RackTile): Placement {
  return { coordinate: { row, col }, tile };
}

describe('checkPlacement', () => {
  it('rejects an empty placement list', () => {
    const result = checkPlacement([], [], makePlayer([]), ORDEL_CLASSIC_BOARD_1);
    expect(result.valid).toBe(false);
  });

  it('rejects a placement outside the board', () => {
    const tile = letterTile('t1');
    const result = checkPlacement(
      [placementAt(20, 20, tile)],
      [],
      makePlayer([tile]),
      ORDEL_CLASSIC_BOARD_1,
    );
    expect(result.valid).toBe(false);
  });

  it('rejects placing a tile not in the rack', () => {
    const tile = letterTile('t1');
    const otherTile = letterTile('t2');
    const result = checkPlacement(
      [placementAt(7, 7, otherTile)],
      [],
      makePlayer([tile]),
      ORDEL_CLASSIC_BOARD_1,
    );
    expect(result.valid).toBe(false);
  });

  it('rejects placing on an already occupied cell', () => {
    const tile = letterTile('t1');
    const board: BoardTileState[] = [
      {
        coordinate: { row: 7, col: 7 },
        letter: 'X' as never,
        isBlank: false,
        bonusConsumed: false,
      },
    ];
    const result = checkPlacement(
      [placementAt(7, 7, tile)],
      board,
      makePlayer([tile]),
      ORDEL_CLASSIC_BOARD_1,
    );
    expect(result.valid).toBe(false);
  });

  it('rejects a blank tile with no assigned letter', () => {
    const blank: RackTile = { id: 'b1', kind: 'blank', assignedLetter: null, value: 0 };
    const result = checkPlacement(
      [placementAt(7, 7, blank)],
      [],
      makePlayer([blank]),
      ORDEL_CLASSIC_BOARD_1,
    );
    expect(result.valid).toBe(false);
  });

  it('rejects placements that do not share a row or column', () => {
    const t1 = letterTile('t1');
    const t2 = letterTile('t2');
    const result = checkPlacement(
      [placementAt(7, 7, t1), placementAt(8, 8, t2)],
      [],
      makePlayer([t1, t2]),
      ORDEL_CLASSIC_BOARD_1,
    );
    expect(result.valid).toBe(false);
  });

  it('rejects a gap in the placement line with no existing tile filling it', () => {
    const t1 = letterTile('t1');
    const t2 = letterTile('t2');
    // (7,7) and (7,9) on the same row, but (7,8) is empty.
    const result = checkPlacement(
      [placementAt(7, 7, t1), placementAt(7, 9, t2)],
      [],
      makePlayer([t1, t2]),
      ORDEL_CLASSIC_BOARD_1,
    );
    expect(result.valid).toBe(false);
  });

  it('accepts a gap filled by an existing tile', () => {
    const t1 = letterTile('t1');
    const t2 = letterTile('t2');
    const board: BoardTileState[] = [
      {
        coordinate: { row: 7, col: 8 },
        letter: 'X' as never,
        isBlank: false,
        bonusConsumed: false,
      },
    ];
    const result = checkPlacement(
      [placementAt(7, 7, t1), placementAt(7, 9, t2)],
      board,
      makePlayer([t1, t2]),
      ORDEL_CLASSIC_BOARD_1,
    );
    // Board is non-empty (has the seed tile), so this is not treated as a "first move" —
    // connectivity via adjacency to the existing tile at (7,8) must hold instead.
    expect(result.valid).toBe(true);
  });

  it('rejects a first move that does not cover the center cell', () => {
    const tile = letterTile('t1');
    const result = checkPlacement(
      [placementAt(0, 0, tile)],
      [],
      makePlayer([tile]),
      ORDEL_CLASSIC_BOARD_1,
    );
    expect(result.valid).toBe(false);
  });

  it('accepts a first move covering the center cell', () => {
    const tile = letterTile('t1');
    const result = checkPlacement(
      [placementAt(7, 7, tile)],
      [],
      makePlayer([tile]),
      ORDEL_CLASSIC_BOARD_1,
    );
    expect(result.valid).toBe(true);
  });

  it('rejects a disconnected move after the first move', () => {
    const tile = letterTile('t1');
    const board: BoardTileState[] = [
      {
        coordinate: { row: 7, col: 7 },
        letter: 'X' as never,
        isBlank: false,
        bonusConsumed: false,
      },
    ];
    const result = checkPlacement(
      [placementAt(0, 0, tile)],
      board,
      makePlayer([tile]),
      ORDEL_CLASSIC_BOARD_1,
    );
    expect(result.valid).toBe(false);
  });

  it('accepts a move that touches an existing tile orthogonally', () => {
    const tile = letterTile('t1');
    const board: BoardTileState[] = [
      {
        coordinate: { row: 7, col: 7 },
        letter: 'X' as never,
        isBlank: false,
        bonusConsumed: false,
      },
    ];
    const result = checkPlacement(
      [placementAt(7, 8, tile)],
      board,
      makePlayer([tile]),
      ORDEL_CLASSIC_BOARD_1,
    );
    expect(result.valid).toBe(true);
  });
});
