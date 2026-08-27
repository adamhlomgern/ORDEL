jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// The real .env is loaded by the Expo CLI, not by plain `jest`. Screens that
// mock '../lib/supabase' never touch this, but the App.test.tsx smoke test
// exercises the real @ordel/shared client construction, which throws
// without these — stub them so that test can still assert "renders without
// crashing" without needing a real backend.
process.env.EXPO_PUBLIC_SUPABASE_URL ??= 'http://localhost:54321';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??= 'test-anon-key';
