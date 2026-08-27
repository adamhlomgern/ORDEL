import type { RandomSource } from '@ordel/game-engine';

/**
 * Web Crypto-backed RandomSource for server-side shuffling/dealing/drawing.
 * GAME_RULES.md section 58 requires "a sufficiently reliable server-side
 * mechanism" — Deno's edge runtime has `crypto.getRandomValues` natively,
 * so there's no reason to settle for `Math.random` here.
 */
export const secureRandom: RandomSource = () => {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 4294967296;
};
