import { describe, expect, it } from 'vitest';
import { isSjuaEligible } from './sjua';

describe('isSjuaEligible', () => {
  it('is eligible when all 7 tiles from a full rack are played', () => {
    expect(isSjuaEligible(7, 7)).toBe(true);
  });

  it('is not eligible when fewer than 7 tiles are played', () => {
    expect(isSjuaEligible(6, 7)).toBe(false);
  });

  it('is not eligible when a shrunk end-game rack (below 7) is fully played', () => {
    expect(isSjuaEligible(4, 4)).toBe(false);
  });
});
