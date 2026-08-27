import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabaseClient, checkSupabaseConnection } from '@ordel/shared';
export type { SupabaseConnectionStatus } from '@ordel/shared';

/**
 * Lazy on purpose: importing this module must not require env vars to be
 * present (e.g. under Jest, where they aren't set). The underlying client
 * is still a singleton (see @ordel/shared) — the first real call from
 * anywhere in the app wins and fixes these auth options for its lifetime.
 */
export function getSupabase() {
  return getSupabaseClient({
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  });
}

export { checkSupabaseConnection };
