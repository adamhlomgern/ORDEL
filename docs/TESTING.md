# Ordel — Testing

## Test pyramid

- **`packages/game-engine`, `packages/dictionary`, `packages/shared`** — unit
  tests via **Vitest**. Pure TypeScript, no mocking of native modules needed.
- **`apps/mobile`** — component/integration tests via **Jest +
  `jest-expo`**. Required for correctly mocking React Native/Expo native
  modules.
- **`packages/types`** — type-only, verified by `tsc --noEmit`; no runtime
  tests apply.

## Commands

```bash
npm run typecheck   # tsc --noEmit across every workspace
npm run lint         # eslint . (flat config, scoped per package/app)
npm run format:check # prettier --check .
npm test             # vitest run (packages) + jest (app), across every workspace
```

Run an individual workspace directly, e.g.:

```bash
npm test -w @ordel/game-engine
npm test -w mobile
```

## What's tested today (V0.1 Milestone A)

`packages/game-engine` (75 tests across 11 files, one file per module —
`GAME_RULES.md` section 78 coverage, using `InMemoryDictionaryProvider` as
the injected dictionary):

- `classicBoard` / `svClassicTiles`: exact bonus-cell counts/coordinates and
  100-tile bag composition from `GAME_RULES.md` sections 8 and 12.
- `placement`: rack/bounds/occupied-cell checks, same-line + no-gap
  enforcement, first-move-through-center, connectivity to existing tiles,
  unassigned-blank rejection.
- `wordExtraction`: main word + per-tile crosswords, existing tiles filling a
  gap between new ones, single-tile ambiguous-axis handling, minimum length.
- `dictionaryValidation`: all invalid words collected, not just the first.
- `scoring`: plain letters, DL, TL, DW, stacked TW×TW (with an incidental DL
  in the same word), never applying a bonus to a non-newly-placed cell,
  blanks always 0, summing multiple simultaneous words.
- `sjua`: eligible at exactly 7/7, ineligible below 7, ineligible for a
  shrunk end-game rack.
- `tileBag`: draw without replacement, partial draw near empty, refill to 7,
  swap ordering (a swap can never redraw what it just returned).
- `boardMutation`: commit + bonus consumption, blank letter resolution.
- `turnActions` / `endGame`: PASS/SWAP/RESIGN state transitions, played-out
  asymmetric transfer, 4-scoreless symmetric self-deduction.
- `makeMove` (integration): turn/status guards, first move, connectivity,
  invalid-word rejection, blank scoring, SJUA end-to-end, PASS/SWAP, and a
  full 4-pass scoreless game ending.

Also: `InMemoryDictionaryProvider` (case-insensitivity, Å/Ä/Ö preserved,
metadata, dev-vs-real version), `getOrdelEnv()` (missing env vars), and
`apps/mobile` rendering without crashing.

**Deferred to the next slice** (needs the not-yet-built Edge Function /
restricted Postgres function): duplicate submission / idempotency — this is
inherently untestable inside `packages/game-engine` since `makeMove()` is a
pure, stateless function with no memory of prior calls (see
`docs/DECISIONS.md`). Also deferred: TIMEOUT, and versioning tests that
require a real database (a game staying tied to its dictionary/board/tile/
rules version once created) rather than pure engine logic.

Whenever a gameplay bug is found later, add a regression test alongside the
fix (`MASTER_PRODUCT_BRIEF.md` section 74).
