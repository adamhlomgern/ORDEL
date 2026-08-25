import type { BoardCell, BoardConfig, BonusType } from '@ordel/types';

/**
 * Bonus cell coordinates transcribed exactly from GAME_RULES.md section 8
 * (`ordel-classic-board-1`). Human-readable labels use columns A-O and
 * rows 1-15; do not "correct" these against Wordfeud/Scrabble layouts.
 */
const TW_LABELS = ['A5', 'A11', 'E1', 'E15', 'K1', 'K15', 'O5', 'O11'];

const DW_LABELS = [
  'B2',
  'B14',
  'C6',
  'C10',
  'F3',
  'F6',
  'F10',
  'F13',
  'J3',
  'J6',
  'J10',
  'J13',
  'M6',
  'M10',
  'N2',
  'N14',
];

const TL_LABELS = [
  'B8',
  'D7',
  'D9',
  'E5',
  'E11',
  'G4',
  'G12',
  'H2',
  'H14',
  'I4',
  'I12',
  'K5',
  'K11',
  'L7',
  'L9',
  'N8',
];

const DL_LABELS = [
  'A8',
  'C3',
  'C13',
  'D4',
  'D12',
  'F8',
  'G7',
  'G9',
  'H1',
  'H6',
  'H10',
  'H15',
  'I7',
  'I9',
  'J8',
  'L4',
  'L12',
  'M3',
  'M13',
  'O8',
];

const START_LABELS = ['H8'];

const BOARD_SIZE = 15;

/** Converts a human-readable label like "H8" into zero-based {row, col}. */
function parseLabel(label: string): { row: number; col: number } {
  const col = label.charCodeAt(0) - 'A'.charCodeAt(0);
  const row = Number(label.slice(1)) - 1;
  return { row, col };
}

function buildCells(): BoardCell[] {
  const bonusByKey = new Map<string, BonusType>();

  const assign = (labels: string[], bonus: BonusType) => {
    for (const label of labels) {
      const { row, col } = parseLabel(label);
      const key = `${row},${col}`;
      if (bonusByKey.has(key)) {
        throw new Error(`ordel-classic-board-1: duplicate bonus assignment at ${label}`);
      }
      bonusByKey.set(key, bonus);
    }
  };

  assign(TW_LABELS, 'TW');
  assign(DW_LABELS, 'DW');
  assign(TL_LABELS, 'TL');
  assign(DL_LABELS, 'DL');
  assign(START_LABELS, 'START');

  const cells: BoardCell[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const key = `${row},${col}`;
      cells.push({ coordinate: { row, col }, bonus: bonusByKey.get(key) ?? null });
    }
  }
  return cells;
}

/**
 * The Classic board layout (GAME_RULES.md sections 5-8). Data-driven per
 * MASTER_PRODUCT_BRIEF.md section 17 — must not be hardcoded into UI.
 */
export const ORDEL_CLASSIC_BOARD_1: BoardConfig = {
  id: 'ordel-classic-board-1',
  size: BOARD_SIZE,
  cells: buildCells(),
};
