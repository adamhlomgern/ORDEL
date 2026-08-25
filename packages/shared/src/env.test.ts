import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getOrdelEnv } from './env';

const ORIGINAL_ENV = { ...process.env };

describe('getOrdelEnv', () => {
  beforeEach(() => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('throws a clear error when Supabase env vars are missing', () => {
    expect(() => getOrdelEnv()).toThrow(/EXPO_PUBLIC_SUPABASE_URL/);
  });

  it('returns the configured values when present', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    expect(getOrdelEnv()).toEqual({
      supabaseUrl: 'http://localhost:54321',
      supabaseAnonKey: 'test-anon-key',
    });
  });
});
