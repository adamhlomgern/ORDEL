import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getOrdelEnv } from './env';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!cachedClient) {
    const { supabaseUrl, supabaseAnonKey } = getOrdelEnv();
    cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return cachedClient;
}

export type SupabaseConnectionStatus = { connected: true } | { connected: false; error: string };

/**
 * Minimal end-to-end proof that the app can reach Supabase through an
 * RLS-gated read (MASTER_PRODUCT_BRIEF.md sections 40 and 53: "Supabase
 * development connection works"). Reads the `app_health` table created
 * specifically for this purpose by supabase/migrations.
 */
export async function checkSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('app_health').select('id').limit(1);
    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true };
  } catch (err) {
    return { connected: false, error: err instanceof Error ? err.message : String(err) };
  }
}
