import * as Crypto from 'expo-crypto';
import type { ProposedMove } from '@ordel/types';
import { getSupabase } from './supabase';

export type Result<T> = { ok: true; data: T } | { ok: false; message: string };

/**
 * `functions.invoke()` puts a non-2xx response into `error`, not `data` —
 * and the actual `{ error: "..." }` body our functions return lives on
 * `error.context` (the raw Response), not on `error.message`. Centralizing
 * that parsing here means screens only ever see a plain Result<T>.
 */
async function invoke<T>(name: string, body: unknown): Promise<Result<T>> {
  const { data, error } = await getSupabase().functions.invoke<T>(name, { body });

  if (error) {
    let message = error.message;
    const context = (error as { context?: Response }).context;
    if (context) {
      try {
        const parsed = await context.json();
        if (parsed && typeof parsed.error === 'string') {
          message = parsed.error;
        }
      } catch {
        // Body wasn't JSON (or already consumed) — fall back to error.message.
      }
    }
    return { ok: false, message };
  }

  return { ok: true, data: data as T };
}

export function createGame(opponentUsername: string): Promise<Result<{ gameId: string }>> {
  return invoke('create-game', { opponentUsername });
}

export interface SubmitTurnActionResult {
  duplicate: boolean;
  moveId: string;
  moveNumber: number;
  score: number;
  wordsCreated: unknown;
  sjuaBonus: boolean;
}

export function submitTurnAction(
  gameId: string,
  action: ProposedMove,
): Promise<Result<SubmitTurnActionResult>> {
  return invoke('submit-turn-action', {
    gameId,
    clientMoveId: Crypto.randomUUID(),
    action,
  });
}
