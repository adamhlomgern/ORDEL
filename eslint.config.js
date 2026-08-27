const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettierConfig = require('eslint-config-prettier');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.expo/**',
      '**/dist/**',
      '**/coverage/**',
      '**/ios/**',
      '**/android/**',
      'supabase/.temp/**',
      'supabase/.branches/**',
      // Deno Edge Functions run outside the Node/TS toolchain entirely (own
      // module resolution via supabase/functions/deno.json, Deno globals,
      // npm: specifiers) — verified via `supabase db reset` + curl, not
      // tsc/eslint. See docs/DECISIONS.md.
      'supabase/functions/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['packages/**/*.{ts,tsx}'],
    rules: {},
  },
  {
    files: ['apps/mobile/**/*.{ts,tsx}'],
    extends: [expoConfig],
  },
  {
    // Root/app-level CommonJS config files (eslint, babel, jest configs).
    files: [
      '*.js',
      'apps/mobile/babel.config.js',
      'apps/mobile/jest.config.js',
      'apps/mobile/jest.setup.js',
    ],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.jest },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // Root-level Node ESM scripts.
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
      globals: globals.node,
    },
  },
  prettierConfig,
);
