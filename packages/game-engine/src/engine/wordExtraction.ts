import type { BoardCoordinate, BoardTileState, Letter, Placement } from '@ordel/types';
import type { PlacementAxis } from './placement';
import { buildCommittedMap, coordKey } from './boardLookup';

export interface WordCell {
  coordinate: BoardCoordinate;
  letter: Letter;
  isBlank: boolean;
  isNewlyPlaced: boolean;
}

export interface WordCandidate {
  cells: WordCell[];
}

interface CombinedCell {
  letter: Letter;
  isBlank: boolean;
  isNewlyPlaced: boolean;
}

/**
 * Extracts every word formed by a placement: the main word along the shared
 * placement line, plus a crossword for each individually newly placed tile
 * (GAME_RULES.md sections 18-23). For a single-tile placement (axis is
 * ambiguous), both the horizontal and vertical runs through that tile are
 * treated as candidates. Only runs of length >= 2 are returned
 * (GAME_RULES.md section 23A) — a move touching nothing is simply an empty
 * result, left for the caller to reject as "no word formed".
 */
export function extractWords(
  board: BoardTileState[],
  placements: Placement[],
  axis: PlacementAxis,
): WordCandidate[] {
  const combined = buildCombinedMap(board, placements);

  if (axis === null) {
    const only = placements[0]!;
    const candidates = [
      runThrough(combined, only.coordinate, 'row'),
      runThrough(combined, only.coordinate, 'col'),
    ].filter((candidate): candidate is WordCandidate => candidate !== null);
    return dedupeCandidates(candidates);
  }

  const perpendicular = axis === 'row' ? 'col' : 'row';
  const mainWord = runThrough(combined, placements[0]!.coordinate, axis);
  const crosswords = placements
    .map((p) => runThrough(combined, p.coordinate, perpendicular))
    .filter((candidate): candidate is WordCandidate => candidate !== null);

  const all = mainWord ? [mainWord, ...crosswords] : crosswords;
  return dedupeCandidates(all);
}

function buildCombinedMap(
  board: BoardTileState[],
  placements: Placement[],
): Map<string, CombinedCell> {
  const committed = buildCommittedMap(board);
  const combined = new Map<string, CombinedCell>();

  for (const [key, tile] of committed) {
    combined.set(key, { letter: tile.letter, isBlank: tile.isBlank, isNewlyPlaced: false });
  }

  for (const placement of placements) {
    const letter =
      placement.tile.kind === 'letter' ? placement.tile.letter : placement.tile.assignedLetter;
    if (!letter) {
      // Guarded upstream by placement.ts; defensively skip rather than crash.
      continue;
    }
    combined.set(coordKey(placement.coordinate), {
      letter,
      isBlank: placement.tile.kind === 'blank',
      isNewlyPlaced: true,
    });
  }

  return combined;
}

/** Walks outward from `origin` along `axis` through contiguous occupied cells. */
function runThrough(
  combined: Map<string, CombinedCell>,
  origin: BoardCoordinate,
  axis: 'row' | 'col',
): WordCandidate | null {
  const step = (coordinate: BoardCoordinate, delta: number): BoardCoordinate =>
    axis === 'row'
      ? { row: coordinate.row, col: coordinate.col + delta }
      : { row: coordinate.row + delta, col: coordinate.col };

  let start = origin;
  while (combined.has(coordKey(step(start, -1)))) {
    start = step(start, -1);
  }

  const cells: WordCell[] = [];
  let cursor: BoardCoordinate | null = start;
  while (cursor && combined.has(coordKey(cursor))) {
    const cell = combined.get(coordKey(cursor))!;
    cells.push({
      coordinate: cursor,
      letter: cell.letter,
      isBlank: cell.isBlank,
      isNewlyPlaced: cell.isNewlyPlaced,
    });
    cursor = step(cursor, 1);
  }

  if (cells.length < 2) {
    return null;
  }

  return { cells };
}

function candidateKey(candidate: WordCandidate): string {
  return candidate.cells.map((c) => coordKey(c.coordinate)).join('|');
}

function dedupeCandidates(candidates: WordCandidate[]): WordCandidate[] {
  const seen = new Map<string, WordCandidate>();
  for (const candidate of candidates) {
    seen.set(candidateKey(candidate), candidate);
  }
  return [...seen.values()];
}

export function wordText(candidate: WordCandidate): string {
  return candidate.cells.map((c) => c.letter).join('');
}
