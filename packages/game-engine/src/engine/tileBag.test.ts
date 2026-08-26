import { describe, expect, it } from 'vitest';
import type { RackTile } from '@ordel/types';
import { drawTiles, refillRack, swapTiles } from './tileBag';

function tile(id: string, letter = 'A'): RackTile {
  return { id, kind: 'letter', letter: letter as never, value: 1 };
}

const sequentialRng = () => 0; // always picks index 0 — deterministic for assertions

describe('drawTiles', () => {
  it('draws the requested count without replacement', () => {
    const bag = [tile('1'), tile('2'), tile('3')];
    const { drawn, remainingBag } = drawTiles(bag, 2, sequentialRng);
    expect(drawn).toHaveLength(2);
    expect(remainingBag).toHaveLength(1);
    // No overlap between drawn and remaining.
    const remainingIds = new Set(remainingBag.map((t) => t.id));
    expect(drawn.every((t) => !remainingIds.has(t.id))).toBe(true);
  });

  it('draws fewer tiles than requested if the bag runs out', () => {
    const bag = [tile('1')];
    const { drawn, remainingBag } = drawTiles(bag, 5, sequentialRng);
    expect(drawn).toHaveLength(1);
    expect(remainingBag).toHaveLength(0);
  });
});

describe('refillRack', () => {
  it('draws until the rack has 7 tiles', () => {
    const rack = [tile('r1'), tile('r2')];
    const bag = Array.from({ length: 10 }, (_, i) => tile(`b${i}`));
    const result = refillRack(rack, bag, sequentialRng);
    expect(result.rack).toHaveLength(7);
    expect(result.bag).toHaveLength(5);
  });

  it('only draws a partial refill when the bag is nearly empty', () => {
    const rack = [tile('r1')];
    const bag = [tile('b1'), tile('b2')];
    const result = refillRack(rack, bag, sequentialRng);
    expect(result.rack).toHaveLength(3); // 1 existing + 2 drawn, bag exhausted
    expect(result.bag).toHaveLength(0);
  });

  it('draws nothing when the rack is already full', () => {
    const rack = Array.from({ length: 7 }, (_, i) => tile(`r${i}`));
    const bag = [tile('b1')];
    const result = refillRack(rack, bag, sequentialRng);
    expect(result.rack).toHaveLength(7);
    expect(result.bag).toHaveLength(1);
  });
});

describe('swapTiles', () => {
  it('rejects a swap when the bag has fewer than 7 tiles', () => {
    const rack = [tile('r1')];
    const bag = Array.from({ length: 6 }, (_, i) => tile(`b${i}`));
    const result = swapTiles(rack, bag, ['r1'], sequentialRng);
    expect(result.ok).toBe(false);
  });

  it('rejects a swap for a tile id not in the rack', () => {
    const rack = [tile('r1')];
    const bag = Array.from({ length: 7 }, (_, i) => tile(`b${i}`));
    const result = swapTiles(rack, bag, ['not-in-rack'], sequentialRng);
    expect(result.ok).toBe(false);
  });

  it('swaps one tile: rack size unchanged, bag size unchanged', () => {
    const rack = [tile('r1'), tile('r2')];
    const bag = Array.from({ length: 7 }, (_, i) => tile(`b${i}`));
    const result = swapTiles(rack, bag, ['r1'], sequentialRng);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rack).toHaveLength(2);
      expect(result.bag).toHaveLength(7);
      expect(result.rack.some((t) => t.id === 'r1')).toBe(false);
      expect(result.rack.some((t) => t.id === 'r2')).toBe(true);
    }
  });

  it('swaps multiple tiles at once', () => {
    const rack = [tile('r1'), tile('r2'), tile('r3')];
    const bag = Array.from({ length: 7 }, (_, i) => tile(`b${i}`));
    const result = swapTiles(rack, bag, ['r1', 'r2'], sequentialRng);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rack).toHaveLength(3);
      expect(result.rack.some((t) => t.id === 'r3')).toBe(true);
    }
  });

  it('never lets a swap immediately redraw one of the tiles it just returned', () => {
    // A bag with exactly 7 tiles, all distinguishable by id. Swap all 7 rack tiles.
    // With a bag of exactly 7 replacements available, the draw must be satisfied entirely
    // from the pre-swap bag contents, and the returned tiles must land at the end.
    const rack = Array.from({ length: 7 }, (_, i) => tile(`r${i}`));
    const bag = Array.from({ length: 7 }, (_, i) => tile(`b${i}`));
    const result = swapTiles(
      rack,
      bag,
      rack.map((t) => t.id),
      sequentialRng,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      // The new rack must be drawn entirely from the original bag ids, never from the returned rack ids.
      expect(result.rack.every((t) => t.id.startsWith('b'))).toBe(true);
      // The returned rack tiles are now sitting in the bag.
      expect(rack.every((t) => result.bag.some((b) => b.id === t.id))).toBe(true);
    }
  });
});
