import { describe, expect, it } from 'vitest';
import type { Placement } from '@ordel/types';
import { commitPlacements } from './boardMutation';
import { ORDEL_CLASSIC_BOARD_1 } from '../board/classicBoard';

describe('commitPlacements', () => {
  it('appends newly placed tiles to the board', () => {
    const placements: Placement[] = [
      {
        coordinate: { row: 7, col: 7 },
        tile: { id: 't1', kind: 'letter', letter: 'A' as never, value: 1 },
      },
    ];
    const board = commitPlacements([], placements, ORDEL_CLASSIC_BOARD_1);
    expect(board).toHaveLength(1);
    expect(board[0]!.letter).toBe('A');
    expect(board[0]!.isBlank).toBe(false);
  });

  it('marks a bonus cell as consumed the first time it is occupied', () => {
    // A8 (row7,col0) is a DL cell.
    const placements: Placement[] = [
      {
        coordinate: { row: 7, col: 0 },
        tile: { id: 't1', kind: 'letter', letter: 'A' as never, value: 1 },
      },
    ];
    const board = commitPlacements([], placements, ORDEL_CLASSIC_BOARD_1);
    expect(board[0]!.bonusConsumed).toBe(true);
  });

  it('leaves bonusConsumed false for a cell with no bonus', () => {
    const placements: Placement[] = [
      {
        coordinate: { row: 0, col: 0 },
        tile: { id: 't1', kind: 'letter', letter: 'A' as never, value: 1 },
      },
    ];
    const board = commitPlacements([], placements, ORDEL_CLASSIC_BOARD_1);
    expect(board[0]!.bonusConsumed).toBe(false);
  });

  it('resolves a blank tile to its assigned letter and marks isBlank true', () => {
    const placements: Placement[] = [
      {
        coordinate: { row: 7, col: 7 },
        tile: { id: 't1', kind: 'blank', assignedLetter: 'Z' as never, value: 0 },
      },
    ];
    const board = commitPlacements([], placements, ORDEL_CLASSIC_BOARD_1);
    expect(board[0]!.letter).toBe('Z');
    expect(board[0]!.isBlank).toBe(true);
  });

  it('preserves previously committed tiles', () => {
    const existing = [
      {
        coordinate: { row: 0, col: 0 },
        letter: 'X' as never,
        isBlank: false,
        bonusConsumed: false,
      },
    ];
    const placements: Placement[] = [
      {
        coordinate: { row: 1, col: 1 },
        tile: { id: 't1', kind: 'letter', letter: 'Y' as never, value: 1 },
      },
    ];
    const board = commitPlacements(existing, placements, ORDEL_CLASSIC_BOARD_1);
    expect(board).toHaveLength(2);
    expect(board[0]).toEqual(existing[0]);
  });
});
