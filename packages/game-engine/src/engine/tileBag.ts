import type { Rack, RackTile } from '@ordel/types';

/** Returns a value in [0, 1). Injectable so tests are deterministic; production
 * callers (e.g. the future Edge Function) should inject a cryptographically
 * secure source (GAME_RULES.md section 58). Defaults to `Math.random` to keep
 * this package dependency-free and portable across runtimes. */
export type RandomSource = () => number;

const FULL_RACK_SIZE = 7;
const MINIMUM_BAG_FOR_SWAP = 7;

function drawOne(bag: RackTile[], rng: RandomSource): { tile: RackTile; remaining: RackTile[] } {
  const index = Math.floor(rng() * bag.length);
  const tile = bag[index]!;
  const remaining = [...bag.slice(0, index), ...bag.slice(index + 1)];
  return { tile, remaining };
}

/** Draws up to `count` random tiles without replacement. Draws fewer if the bag runs out. */
export function drawTiles(
  bag: RackTile[],
  count: number,
  rng: RandomSource = Math.random,
): { drawn: RackTile[]; remainingBag: RackTile[] } {
  let remaining = bag;
  const drawn: RackTile[] = [];
  const toDraw = Math.min(count, bag.length);

  for (let i = 0; i < toDraw; i++) {
    const result = drawOne(remaining, rng);
    drawn.push(result.tile);
    remaining = result.remaining;
  }

  return { drawn, remainingBag: remaining };
}

/** Draws until the rack has 7 tiles or the bag is empty (GAME_RULES.md section 11). */
export function refillRack(
  rack: Rack,
  bag: RackTile[],
  rng: RandomSource = Math.random,
): { rack: Rack; bag: RackTile[] } {
  const needed = Math.max(0, FULL_RACK_SIZE - rack.length);
  const { drawn, remainingBag } = drawTiles(bag, needed, rng);
  return { rack: [...rack, ...drawn], bag: remainingBag };
}

export type SwapResult = { ok: true; rack: Rack; bag: RackTile[] } | { ok: false; reason: string };

/**
 * Exchanges 1-7 rack tiles (GAME_RULES.md section 43). Requires at least 7
 * tiles in the bag *before* the swap. Order matters: replacements are drawn
 * from the bag before the swapped-out tiles are returned to it, so a swap
 * can never immediately redraw a tile it just gave back.
 */
export function swapTiles(
  rack: Rack,
  bag: RackTile[],
  tileIds: string[],
  rng: RandomSource = Math.random,
): SwapResult {
  if (tileIds.length === 0) {
    return { ok: false, reason: 'Select at least one tile to swap.' };
  }

  const toSwap = rack.filter((tile) => tileIds.includes(tile.id));
  if (toSwap.length !== tileIds.length) {
    return { ok: false, reason: 'One or more tiles to swap are not in the current rack.' };
  }

  if (bag.length < MINIMUM_BAG_FOR_SWAP) {
    return { ok: false, reason: 'Swap requires at least 7 tiles remaining in the bag.' };
  }

  const remainingRack = rack.filter((tile) => !tileIds.includes(tile.id));
  const { drawn, remainingBag } = drawTiles(bag, toSwap.length, rng);

  return {
    ok: true,
    rack: [...remainingRack, ...drawn],
    bag: [...remainingBag, ...toSwap],
  };
}
