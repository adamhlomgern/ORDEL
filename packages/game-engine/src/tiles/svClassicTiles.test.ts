import { describe, expect, it } from 'vitest';
import { ORDEL_SV_TILES_1 } from './svClassicTiles';

function definitionFor(letter: string) {
  return ORDEL_SV_TILES_1.tiles.find((tile) => tile.letter === letter);
}

describe('ordel-sv-tiles-1', () => {
  it('contains exactly 100 tiles total (98 letters + 2 blanks, GAME_RULES.md section 12)', () => {
    const letterTotal = ORDEL_SV_TILES_1.tiles.reduce((sum, tile) => sum + tile.count, 0);
    expect(letterTotal).toBe(98);
    expect(ORDEL_SV_TILES_1.blankCount).toBe(2);
    expect(letterTotal + ORDEL_SV_TILES_1.blankCount).toBe(100);
  });

  it('defines all 29 Swedish letters exactly once each', () => {
    const letters = ORDEL_SV_TILES_1.tiles.map((tile) => tile.letter);
    expect(letters).toHaveLength(29);
    expect(new Set(letters).size).toBe(29);
  });

  it('matches spot-checked counts and values from GAME_RULES.md section 12', () => {
    expect(definitionFor('A')).toEqual({ letter: 'A', count: 8, value: 1 });
    expect(definitionFor('Q')).toEqual({ letter: 'Q', count: 1, value: 10 });
    expect(definitionFor('Z')).toEqual({ letter: 'Z', count: 1, value: 10 });
    expect(definitionFor('C')).toEqual({ letter: 'C', count: 1, value: 8 });
    expect(definitionFor('Å')).toEqual({ letter: 'Å', count: 2, value: 4 });
    expect(definitionFor('Ä')).toEqual({ letter: 'Ä', count: 2, value: 3 });
    expect(definitionFor('Ö')).toEqual({ letter: 'Ö', count: 2, value: 4 });
    expect(definitionFor('W')).toEqual({ letter: 'W', count: 1, value: 6 });
  });

  it('assigns no letter a count or value of zero or less', () => {
    for (const tile of ORDEL_SV_TILES_1.tiles) {
      expect(tile.count).toBeGreaterThan(0);
      expect(tile.value).toBeGreaterThan(0);
    }
  });
});
