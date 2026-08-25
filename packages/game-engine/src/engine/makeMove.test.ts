import { describe, expect, it } from 'vitest';
import type { GameState, ProposedMove } from '@ordel/types';
import { makeMove } from './makeMove';

// Full rule logic isn't implemented until V0.1 — this only proves the
// exported function signature compiles and behaves predictably as a stub.
const stubGameState = {} as GameState;

describe('makeMove (V0.0 stub)', () => {
  it('rejects a PLAY move with no placements', () => {
    const move: ProposedMove = { type: 'PLAY', placements: [] };
    const result = makeMove(stubGameState, move);
    expect(result.valid).toBe(false);
  });

  it('returns a not-yet-implemented result for a well-formed move', () => {
    const move: ProposedMove = { type: 'PASS' };
    const result = makeMove(stubGameState, move);
    expect(result.valid).toBe(false);
  });
});
