import type { TileBagConfig, TileDefinition } from '@ordel/types';

/**
 * Swedish Classic tile distribution and values, transcribed exactly from
 * GAME_RULES.md section 12 (`ordel-sv-tiles-1`). This is a versioned,
 * intentional beta balance decision — do not "correct" it against
 * Wordfeud/Scrabble letter distributions (GAME_RULES.md section 80).
 */
const TILE_DEFINITIONS: TileDefinition[] = [
  { letter: 'A', count: 8, value: 1 },
  { letter: 'B', count: 2, value: 4 },
  { letter: 'C', count: 1, value: 8 },
  { letter: 'D', count: 4, value: 1 },
  { letter: 'E', count: 7, value: 1 },
  { letter: 'F', count: 2, value: 3 },
  { letter: 'G', count: 3, value: 2 },
  { letter: 'H', count: 2, value: 2 },
  { letter: 'I', count: 5, value: 1 },
  { letter: 'J', count: 1, value: 7 },
  { letter: 'K', count: 3, value: 2 },
  { letter: 'L', count: 4, value: 1 },
  { letter: 'M', count: 3, value: 2 },
  { letter: 'N', count: 6, value: 1 },
  { letter: 'O', count: 5, value: 2 },
  { letter: 'P', count: 2, value: 4 },
  { letter: 'Q', count: 1, value: 10 },
  { letter: 'R', count: 8, value: 1 },
  { letter: 'S', count: 8, value: 1 },
  { letter: 'T', count: 8, value: 1 },
  { letter: 'U', count: 3, value: 4 },
  { letter: 'V', count: 2, value: 3 },
  { letter: 'W', count: 1, value: 6 },
  { letter: 'X', count: 1, value: 8 },
  { letter: 'Y', count: 1, value: 7 },
  { letter: 'Z', count: 1, value: 10 },
  { letter: 'Å', count: 2, value: 4 },
  { letter: 'Ä', count: 2, value: 3 },
  { letter: 'Ö', count: 2, value: 4 },
];

/** Blank tiles always contribute 0 points (GAME_RULES.md section 16). */
const BLANK_COUNT = 2;

export const ORDEL_SV_TILES_1: TileBagConfig = {
  id: 'ordel-sv-tiles-1',
  tiles: TILE_DEFINITIONS,
  blankCount: BLANK_COUNT,
};
