/**
 * Reads Supabase connection info from Expo's native EXPO_PUBLIC_* env
 * inlining (no app.config.ts `extra` indirection needed). See
 * apps/mobile/.env.example and docs/DECISIONS.md.
 */
export interface OrdelEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function getOrdelEnv(): OrdelEnv {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Set EXPO_PUBLIC_SUPABASE_URL and ' +
        'EXPO_PUBLIC_SUPABASE_ANON_KEY (see apps/mobile/.env.example).',
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}
