import { createGame, submitTurnAction } from '../edgeFunctions';

const mockInvoke = jest.fn();

jest.mock('../supabase', () => ({
  getSupabase: () => ({ functions: { invoke: mockInvoke } }),
}));

jest.mock('expo-crypto', () => ({ randomUUID: () => 'fixed-uuid' }));

beforeEach(() => {
  mockInvoke.mockReset();
});

describe('createGame', () => {
  it('returns ok:true with the data on success', async () => {
    mockInvoke.mockResolvedValue({ data: { gameId: 'game-1' }, error: null });

    const result = await createGame('Motstandare');

    expect(mockInvoke).toHaveBeenCalledWith('create-game', {
      body: { opponentUsername: 'Motstandare' },
    });
    expect(result).toEqual({ ok: true, data: { gameId: 'game-1' } });
  });

  it('parses the JSON error body from error.context rather than using error.message', async () => {
    const context = { json: () => Promise.resolve({ error: 'Opponent not found.' }) };
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Edge Function returned a non-2xx status code', context },
    });

    const result = await createGame('Nobody');

    expect(result).toEqual({ ok: false, message: 'Opponent not found.' });
  });

  it('falls back to error.message when context has no JSON body', async () => {
    const context = { json: () => Promise.reject(new Error('not json')) };
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'network error', context },
    });

    const result = await createGame('Someone');

    expect(result).toEqual({ ok: false, message: 'network error' });
  });
});

describe('submitTurnAction', () => {
  it('generates a clientMoveId and forwards the action', async () => {
    mockInvoke.mockResolvedValue({
      data: {
        duplicate: false,
        moveId: 'm1',
        moveNumber: 1,
        score: 4,
        wordsCreated: [],
        sjuaBonus: false,
      },
      error: null,
    });

    const result = await submitTurnAction('game-1', { type: 'PASS' });

    expect(mockInvoke).toHaveBeenCalledWith('submit-turn-action', {
      body: { gameId: 'game-1', clientMoveId: 'fixed-uuid', action: { type: 'PASS' } },
    });
    expect(result.ok).toBe(true);
  });
});
