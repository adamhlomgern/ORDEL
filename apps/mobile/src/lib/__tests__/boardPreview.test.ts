import type { BoardTileState, Placement, RackTile } from '@ordel/types';
import { previewPlay } from '../boardPreview';

function letterTile(id: string, letter: string, value = 1): RackTile {
  return { id, kind: 'letter', letter: letter as never, value };
}

function placement(row: number, col: number, tile: RackTile): Placement {
  return { coordinate: { row, col }, tile };
}

describe('previewPlay', () => {
  it('scores a valid first move through the center', () => {
    const rack = [letterTile('b', 'B', 4), letterTile('i', 'I', 1), letterTile('l', 'L', 1)];
    const placements = [
      placement(7, 6, rack[0]!),
      placement(7, 7, rack[1]!),
      placement(7, 8, rack[2]!),
    ];

    const result = previewPlay([], rack, placements);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.wordsCreated.map((w) => w.word)).toEqual(['BIL']);
      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.sjuaBonus).toBe(false);
    }
  });

  it('rejects a lone center tile that forms no word', () => {
    const rack = [letterTile('a', 'A')];
    const placements = [placement(7, 7, rack[0]!)];

    const result = previewPlay([], rack, placements);

    expect(result).toEqual({
      valid: false,
      reason: 'This placement does not form any word.',
    });
  });

  it('rejects a word not accepted by the dictionary', () => {
    const rack = [letterTile('q', 'Q', 10), letterTile('z', 'Z', 10)];
    const placements = [placement(7, 7, rack[0]!), placement(7, 8, rack[1]!)];

    const result = previewPlay([], rack, placements);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain('Not accepted in the dictionary');
    }
  });

  it('rejects a placement that does not cover the center on the first move', () => {
    const rack = [letterTile('b', 'B'), letterTile('i', 'I'), letterTile('l', 'L')];
    const placements = [
      placement(3, 3, rack[0]!),
      placement(3, 4, rack[1]!),
      placement(3, 5, rack[2]!),
    ];

    const result = previewPlay([], rack, placements);

    expect(result).toEqual({
      valid: false,
      reason: 'The first move must cover the center cell.',
    });
  });

  it('grants the SJUA bonus for a full 7-tile rack played entirely', () => {
    const rack = [
      letterTile('s', 'S', 1),
      letterTile('v', 'V', 3),
      letterTile('e1', 'E', 1),
      letterTile('r', 'R', 1),
      letterTile('i', 'I', 1),
      letterTile('g', 'G', 2),
      letterTile('e2', 'E', 1),
    ];
    const placements = rack.map((tile, i) => placement(7, 7 + i, tile));

    const result = previewPlay([], rack, placements);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.wordsCreated.map((w) => w.word)).toEqual(['SVERIGE']);
      expect(result.sjuaBonus).toBe(true);
    }
  });

  it('extends an existing board rather than requiring the center again', () => {
    // Existing horizontal "BIL" at row7 cols6-8. New "K","E","A" below the
    // existing "I" (row7,col7) spell "IKEA" downward — a real dev-dictionary
    // word, and connects without needing to cover the center again.
    const board: BoardTileState[] = [
      {
        coordinate: { row: 7, col: 6 },
        letter: 'B' as never,
        isBlank: false,
        bonusConsumed: false,
      },
      {
        coordinate: { row: 7, col: 7 },
        letter: 'I' as never,
        isBlank: false,
        bonusConsumed: true,
      },
      {
        coordinate: { row: 7, col: 8 },
        letter: 'L' as never,
        isBlank: false,
        bonusConsumed: false,
      },
    ];
    const rack = [letterTile('k', 'K', 2), letterTile('e', 'E', 1), letterTile('a', 'A', 1)];
    const placements = [
      placement(8, 7, rack[0]!),
      placement(9, 7, rack[1]!),
      placement(10, 7, rack[2]!),
    ];

    const result = previewPlay(board, rack, placements);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.wordsCreated.map((w) => w.word)).toEqual(['IKEA']);
    }
  });
});
