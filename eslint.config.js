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
    files: ['*.js', 'apps/mobile/babel.config.js', 'apps/mobile/jest.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  prettierConfig,
);
