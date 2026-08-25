# Ordel — Architecture (V0.0)

This describes the technical architecture as of **V0.0 — Foundation**. Update
this document whenever the architecture actually changes; do not let it drift
from reality (see `MASTER_PRODUCT_BRIEF.md` section 1).

## Repository layout

```
ORDEL/
├── apps/mobile/        Expo React Native TypeScript app (the only app for now)
├── packages/
│   ├── types/           Shared TypeScript domain types — no logic
│   ├── game-engine/     Framework-independent game rules/data
│   ├── dictionary/      DictionaryProvider abstraction + dev fixture
│   └── shared/          Cross-cutting utilities (env, Supabase client)
├── supabase/            Local Supabase project: migrations, seed, functions
└── docs/                This documentation set (see below)
```

## Monorepo tooling

**npm workspaces** — chosen over pnpm (pnpm's strict symlinked `node_modules`
has recurring friction with Metro's classic Node resolution) and over
Turborepo/Nx (nothing to cache yet: every package is source-only with no build
step, so a task-runner would add infrastructure with no problem to solve).
Revisit this only if the package count or build times become a real pain
point — see `DECISIONS.md`.

**Packages are source-only.** Every `packages/*` package points `main`/`types`
directly at `src/index.ts` — there is no `dist/` and no build step. Metro (for
the app) and Vitest (for package tests) both transpile TypeScript on the fly.
Cross-package imports use the `@ordel/*` workspace package name (symlinked
into `node_modules/@ordel/*` by npm), never relative `../../packages/...`
paths or `tsconfig` path aliases.

## Package boundaries

- **`@ordel/types`** — pure type definitions (board, tiles, game state, moves).
  No runtime code, no dependencies.
- **`@ordel/game-engine`** — the versioned Classic board (`ordel-classic-board-1`)
  and tile bag (`ordel-sv-tiles-1`) as data, plus the `makeMove()` entry point.
  **Must never depend on React, React Native, Expo, or Supabase** — this is
  enforced by convention and must stay that way as real rule logic is added in
  V0.1 (`MASTER_PRODUCT_BRIEF.md` section 11).
- **`@ordel/dictionary`** — the `DictionaryProvider` interface plus a
  small, explicitly dev-only in-memory implementation (`ordel-sv-dev-0.0.0`).
  The real `ordel-sv-1.0` dictionary pipeline (SALDO, Sprakradet, names,
  places, Ordel Extended — see `DICTIONARY_POLICY.md`) is a separate, later
  effort gated by `GAME_RULES.md` sections 79-80.
- **`@ordel/shared`** — environment variable access (`getOrdelEnv`) and the
  Supabase client (`getSupabaseClient`, `checkSupabaseConnection`). Anything
  used by both the app and (eventually) Supabase Edge Functions belongs here.
- **`apps/mobile`** — the Expo app. Thin: navigation, screens, design tokens.
  All game logic lives in `@ordel/game-engine`; all vocabulary lives behind
  `@ordel/dictionary`. The app never hardcodes gameplay data.

## Environment / configuration

Supabase connection info flows through Expo's native `EXPO_PUBLIC_*` env
inlining: values in `apps/mobile/.env` (gitignored) prefixed with
`EXPO_PUBLIC_` are inlined into the client bundle by Expo/Metro automatically.
No `app.config.ts extra` + `expo-constants` indirection is used — it isn't
needed with this mechanism. `apps/mobile/.env.example` documents the required
variables with placeholder values only.

`apps/mobile/app.config.ts` (dynamic config) holds everything that isn't a
secret: app name, slug, scheme, bundle identifiers.

## Testing strategy

- **`packages/*`** (pure TypeScript, no React Native) use **Vitest** —
  zero-config TS/ESM support, fast watch mode.
- **`apps/mobile`** uses **Jest with the `jest-expo` preset** — required by
  the Expo/React Native ecosystem for correctly mocking native modules.

This split avoids forcing React Native-oriented Jest config onto pure logic
packages that have no use for it. See `TESTING.md` for commands and the full
target test matrix.

## Backend (V0.0 scope)

Local Supabase via the Supabase CLI + Docker (`supabase start`). V0.0 has no
real product schema — only a single `app_health` table (see `DATABASE.md`)
used purely to prove the full path: client → Supabase → Postgres → Row Level
Security → back to the client. RLS is enabled from this very first table,
establishing the convention from day one (`MASTER_PRODUCT_BRIEF.md` section 40) rather than bolting it on later.

Supabase Realtime, Auth, and Edge Functions are configured by
`supabase/config.toml` but not used by any app code yet — that begins in
V0.1 (`GAME_RULES.md` server-authority model, `MASTER_PRODUCT_BRIEF.md`
section 39 auth).

## What V0.0 deliberately does not include

- No login/auth flow (V0.1).
- No real game-rule logic in `makeMove()` — only the typed signature (V0.1).
- No real Swedish dictionary — only a tiny dev fixture (V0.1 dictionary gate).
- No component design system beyond a handful of raw tokens (V0.1/V0.2).
- No CI (no remote yet; see `ROADMAP.md`).
