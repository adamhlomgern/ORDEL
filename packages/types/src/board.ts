/**
 * Board coordinate system per GAME_RULES.md section 6.
 * Zero-based: rows 0-14, columns 0-14. Row 0 = human-readable row 1,
 * column 0 = human-readable column A.
 */
export interface BoardCoordinate {
  row: number;
  col: number;
}

/**
 * Bonus cell types per GAME_RULES.md section 8.
 * `START` marks the center cell (H8 / {row:7, col:7}) and carries no multiplier.
 */
export type BonusType = 'DL' | 'TL' | 'DW' | 'TW' | 'START' | null;

export interface BoardCell {
  coordinate: BoardCoordinate;
  bonus: BonusType;
}

/**
 * A versioned, data-driven board layout. Must never be hardcoded into UI
 * components (MASTER_PRODUCT_BRIEF.md section 17; GAME_RULES.md section 76).
 */
export interface BoardConfig {
  id: string;
  size: number;
  cells: BoardCell[];
}
