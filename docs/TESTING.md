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

## What's tested today (V0.0)

- `ordel-classic-board-1`: exact bonus-cell counts and coordinates from
  `GAME_RULES.md` section 8, center-cell placement.
- `ordel-sv-tiles-1`: tile bag sums to exactly 100 (98 letters + 2 blanks),
  spot-checked counts/values from `GAME_RULES.md` section 12.
- `makeMove()`: signature compiles and behaves predictably as a V0.1-pending
  stub.
- `InMemoryDictionaryProvider`: case-insensitive lookup, Å/Ä/Ö preserved as
  distinct letters, metadata retrieval, dev-vs-real version distinction.
- `getOrdelEnv()`: clear error when Supabase env vars are missing.
- `apps/mobile`: app renders without crashing.

## Target test matrix for V0.1 (game engine)

Once real rule logic replaces the `makeMove()` stub, `GAME_RULES.md` section
78 defines the required coverage. Do not consider V0.1's engine complete
until all of these exist:

**Placement:** valid/invalid first move through center, valid horizontal and
vertical placement, disconnected placement, occupied-cell placement, using
existing letters between new tiles, single-tile placement.

**Dictionary:** valid standard word, valid inflection, valid Ordel Extended
word, valid proper noun/brand/slang/offensive word, invalid random string,
one invalid crossword invalidating the whole move.

**Scoring:** normal letters, DL/TL/DW/TW, multiple word multipliers, crossing
words, multiple words in one move, blank tiles, consumed bonus cells, SJUA
+50.

**Rack:** correct removal, correct refill, partial refill near an empty bag,
empty bag.

**Turns:** PLAY, PASS, SWAP, RESIGN, wrong-player rejection, duplicate
submission (idempotency).

**Swap:** one tile, multiple tiles, insufficient bag size, exchanged tiles
excluded from the immediate redraw.

**Game ending:** played out, final rack deduction (both variants), scoreless
turn ending, resignation, timeout, draw.

**Versioning:** a game stays tied to its dictionary/board/tile/rules version
even after newer versions are released.

Whenever a gameplay bug is found later, add a regression test alongside the
fix (`MASTER_PRODUCT_BRIEF.md` section 74).
