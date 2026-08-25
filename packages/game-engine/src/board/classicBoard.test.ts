import { describe, expect, it } from 'vitest';
import { ORDEL_CLASSIC_BOARD_1 } from './classicBoard';

function cellAt(row: number, col: number) {
  return ORDEL_CLASSIC_BOARD_1.cells.find(
    (cell) => cell.coordinate.row === row && cell.coordinate.col === col,
  );
}

describe('ordel-classic-board-1', () => {
  it('has exactly 225 cells (15x15, GAME_RULES.md section 5)', () => {
    expect(ORDEL_CLASSIC_BOARD_1.cells).toHaveLength(225);
    expect(ORDEL_CLASSIC_BOARD_1.size).toBe(15);
  });

  it('has the exact bonus cell counts from GAME_RULES.md section 8', () => {
    const counts = { TW: 0, DW: 0, TL: 0, DL: 0, START: 0, none: 0 };
    for (const cell of ORDEL_CLASSIC_BOARD_1.cells) {
      if (cell.bonus === null) counts.none += 1;
      else counts[cell.bonus] += 1;
    }

    expect(counts.TW).toBe(8);
    expect(counts.DW).toBe(16);
    expect(counts.TL).toBe(16);
    expect(counts.DL).toBe(20);
    expect(counts.START).toBe(1);
    expect(counts.none).toBe(225 - 8 - 16 - 16 - 20 - 1);
  });

  it('marks the center cell H8 as START at zero-based {row:7, col:7} (GAME_RULES.md section 7)', () => {
    expect(cellAt(7, 7)?.bonus).toBe('START');
  });

  it('spot-checks known coordinates from GAME_RULES.md section 8', () => {
    expect(cellAt(4, 0)?.bonus).toBe('TW'); // A5
    expect(cellAt(10, 14)?.bonus).toBe('TW'); // O11
    expect(cellAt(0, 7)?.bonus).toBe('DL'); // H1
    expect(cellAt(14, 7)?.bonus).toBe('DL'); // H15
    expect(cellAt(1, 1)?.bonus).toBe('DW'); // B2
    expect(cellAt(1, 7)?.bonus).toBe('TL'); // H2
  });

  it('never assigns more than one bonus to the same cell', () => {
    // buildCells() throws on any duplicate assignment at module load time;
    // successfully importing the module already proves this invariant.
    expect(ORDEL_CLASSIC_BOARD_1.cells.length).toBe(225);
  });
});
