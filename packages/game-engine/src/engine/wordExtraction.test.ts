import { describe, expect, it } from 'vitest';
import type { BoardTileState, Placement } from '@ordel/types';
import { extractWords, wordText } from './wordExtraction';

function boardTile(row: number, col: number, letter: string): BoardTileState {
  return {
    coordinate: { row, col },
    letter: letter as never,
    isBlank: false,
    bonusConsumed: false,
  };
}

function placement(row: number, col: number, letter: string, id: string): Placement {
  return {
    coordinate: { row, col },
    tile: { id, kind: 'letter', letter: letter as never, value: 1 },
  };
}

describe('extractWords', () => {
  it('extracts a single main word from a multi-tile horizontal placement on an empty board', () => {
    const placements = [
      placement(7, 6, 'B', 't1'),
      placement(7, 7, 'I', 't2'),
      placement(7, 8, 'L', 't3'),
    ];
    const words = extractWords([], placements, 'row');
    expect(words).toHaveLength(1);
    expect(wordText(words[0]!)).toBe('BIL');
  });

  it('includes existing board tiles that sit between new placements', () => {
    // Existing "T" at (7,8); new C,A at (7,6)-(7,7) plus T-less gap filled by existing tile.
    const board = [boardTile(7, 8, 'T')];
    const placements = [placement(7, 6, 'C', 't1'), placement(7, 7, 'A', 't2')];
    const words = extractWords(board, placements, 'row');
    expect(wordText(words[0]!)).toBe('CAT');
  });

  it('forms the main word from a vertical run through an existing tile between two new ones', () => {
    // Existing horizontal "BIL" at row7 cols6-8. New vertical "S" at (6,6) and "A" at (8,6)
    // share col6 with the existing "B" at (7,6), forming the vertical main word "SBA".
    const board = [boardTile(7, 6, 'B'), boardTile(7, 7, 'I'), boardTile(7, 8, 'L')];
    const placements = [placement(6, 6, 'S', 't1'), placement(8, 6, 'A', 't2')];
    const words = extractWords(board, placements, 'col');
    const texts = words.map(wordText).sort();
    expect(texts).toEqual(['SBA']);
  });

  it('treats a single-tile placement as up to two candidates (both axes)', () => {
    // Existing "BIL" horizontal at row7 cols6-8. Place "S" at (6,7) — vertical run "SI" (through
    // existing I), horizontal run at row6 is just "S" alone (filtered, length 1).
    const board = [boardTile(7, 6, 'B'), boardTile(7, 7, 'I'), boardTile(7, 8, 'L')];
    const placements = [placement(6, 7, 'S', 't1')];
    const words = extractWords(board, placements, null);
    expect(words.map(wordText)).toEqual(['SI']);
  });

  it('returns no candidates for a fully isolated single tile', () => {
    const placements = [placement(3, 3, 'A', 't1')];
    const words = extractWords([], placements, null);
    expect(words).toHaveLength(0);
  });

  it('reports the main word exactly once when no individual tile forms a separate crossword', () => {
    const placements = [placement(0, 0, 'H', 't1'), placement(0, 1, 'I', 't2')];
    const words = extractWords([], placements, 'row');
    expect(words).toHaveLength(1);
    expect(wordText(words[0]!)).toBe('HI');
  });
});
