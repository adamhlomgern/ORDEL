import type { BoardConfig, BoardTileState, GamePlayer, Placement } from '@ordel/types';
import { buildCommittedMap, coordKey, isWithinBounds } from './boardLookup';

export type PlacementAxis = 'row' | 'col' | null;

export type PlacementCheckResult =
  { valid: true; axis: PlacementAxis } | { valid: false; reason: string };

/**
 * Structural validation of a proposed PLAY's placements: bounds, rack
 * ownership, empty target cells, a single shared line with no gaps, and
 * connectivity (first-move-through-center, or touching the existing board
 * otherwise). Does not extract words, validate the dictionary, or score —
 * see wordExtraction.ts / dictionaryValidation.ts / scoring.ts.
 */
export function checkPlacement(
  placements: Placement[],
  board: BoardTileState[],
  actingPlayer: GamePlayer,
  boardConfig: BoardConfig,
): PlacementCheckResult {
  if (placements.length === 0) {
    return { valid: false, reason: 'A PLAY move requires at least one placement.' };
  }

  const committed = buildCommittedMap(board);
  const rackTileIds = new Set(actingPlayer.rack.map((tile) => tile.id));
  const seenKeys = new Set<string>();

  for (const placement of placements) {
    if (!isWithinBounds(placement.coordinate, boardConfig)) {
      return { valid: false, reason: 'Placement is outside the board.' };
    }

    const key = coordKey(placement.coordinate);

    if (seenKeys.has(key)) {
      return { valid: false, reason: 'The same cell cannot be used twice in one move.' };
    }
    seenKeys.add(key);

    if (committed.has(key)) {
      return { valid: false, reason: 'Cannot place a tile on an already occupied cell.' };
    }

    if (!rackTileIds.has(placement.tile.id)) {
      return { valid: false, reason: 'Placed tile does not belong to the current rack.' };
    }

    if (placement.tile.kind === 'blank' && placement.tile.assignedLetter === null) {
      return {
        valid: false,
        reason: 'A blank tile must have a letter selected before submission.',
      };
    }
  }

  const rows = new Set(placements.map((p) => p.coordinate.row));
  const cols = new Set(placements.map((p) => p.coordinate.col));

  let axis: PlacementAxis;
  if (placements.length === 1) {
    axis = null;
  } else if (rows.size === 1) {
    axis = 'row';
  } else if (cols.size === 1) {
    axis = 'col';
  } else {
    return { valid: false, reason: 'All placed tiles must share the same row or column.' };
  }

  if (axis !== null) {
    const gapReason = findLineGap(placements, board, axis);
    if (gapReason) {
      return { valid: false, reason: gapReason };
    }
  }

  const isFirstMove = board.length === 0;
  const centerCoordinate = getCenterCoordinate(boardConfig);

  if (isFirstMove) {
    const coversCenter = placements.some(
      (p) => p.coordinate.row === centerCoordinate.row && p.coordinate.col === centerCoordinate.col,
    );
    if (!coversCenter) {
      return { valid: false, reason: 'The first move must cover the center cell.' };
    }
  } else {
    const isConnected = placements.some((p) => hasExistingNeighbor(p.coordinate, committed));
    if (!isConnected) {
      return {
        valid: false,
        reason: 'Placement must connect to at least one tile already on the board.',
      };
    }
  }

  return { valid: true, axis };
}

function getCenterCoordinate(boardConfig: BoardConfig) {
  const center = Math.floor(boardConfig.size / 2);
  return { row: center, col: center };
}

/** No empty gaps between the minimum and maximum placement along the shared line. */
function findLineGap(
  placements: Placement[],
  board: BoardTileState[],
  axis: 'row' | 'col',
): string | null {
  const committed = buildCommittedMap(board);
  const newKeys = new Set(placements.map((p) => coordKey(p.coordinate)));

  const positions = placements.map((p) => (axis === 'row' ? p.coordinate.col : p.coordinate.row));
  const firstPlacement = placements[0]!;
  const fixed = axis === 'row' ? firstPlacement.coordinate.row : firstPlacement.coordinate.col;
  const min = Math.min(...positions);
  const max = Math.max(...positions);

  for (let pos = min; pos <= max; pos++) {
    const coordinate = axis === 'row' ? { row: fixed, col: pos } : { row: pos, col: fixed };
    const key = coordKey(coordinate);
    if (!newKeys.has(key) && !committed.has(key)) {
      return 'Placed tiles must form a continuous line with no gaps.';
    }
  }

  return null;
}

function hasExistingNeighbor(
  coordinate: { row: number; col: number },
  committed: Map<string, BoardTileState>,
): boolean {
  const neighbors = [
    { row: coordinate.row - 1, col: coordinate.col },
    { row: coordinate.row + 1, col: coordinate.col },
    { row: coordinate.row, col: coordinate.col - 1 },
    { row: coordinate.row, col: coordinate.col + 1 },
  ];
  return neighbors.some((n) => committed.has(coordKey(n)));
}
