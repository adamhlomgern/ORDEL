import type { BoardCoordinate, BoardConfig, BoardTileState, BonusType } from '@ordel/types';

/** Deterministic map key for a board coordinate. */
export function coordKey(coordinate: BoardCoordinate): string {
  return `${coordinate.row},${coordinate.col}`;
}

/** Indexes committed board tiles by coordinate for O(1) lookup. */
export function buildCommittedMap(board: BoardTileState[]): Map<string, BoardTileState> {
  const map = new Map<string, BoardTileState>();
  for (const tile of board) {
    map.set(coordKey(tile.coordinate), tile);
  }
  return map;
}

/** Indexes a board configuration's static bonus cells by coordinate for O(1) lookup. */
export function buildBonusMap(boardConfig: BoardConfig): Map<string, BonusType> {
  const map = new Map<string, BonusType>();
  for (const cell of boardConfig.cells) {
    map.set(coordKey(cell.coordinate), cell.bonus);
  }
  return map;
}

export function isWithinBounds(coordinate: BoardCoordinate, boardConfig: BoardConfig): boolean {
  return (
    coordinate.row >= 0 &&
    coordinate.row < boardConfig.size &&
    coordinate.col >= 0 &&
    coordinate.col < boardConfig.size
  );
}
