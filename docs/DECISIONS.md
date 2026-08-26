# Ordel — Decisions Log

Long-term-consequence decisions, per `MASTER_PRODUCT_BRIEF.md` section 1: "If
a decision has long-term consequences, document it in DECISIONS.md." Newest
entries at the top.

---

## V0.1 Milestone A — game engine + schema decisions

### `makeMove()` gained `actingPlayerId` and `dictionary` parameters

**Context:** the V0.0 stub was `makeMove(gameState, proposedMove)`. Turn
ownership verification and dictionary validation are both explicitly the
engine's job (`MASTER_PRODUCT_BRIEF.md` section 12), and neither is possible
without knowing who is acting or having a dictionary to check words against.
**Decision:** `makeMove(gameState, proposedMove, actingPlayerId, dictionary, rng?)`.
`dictionary` is typed against `@ordel/dictionary`'s `DictionaryProvider`
interface only — the engine never imports a concrete implementation, so it
stays agnostic to which dictionary is active (the dev fixture today, the
real `ordel-sv` pipeline later). `rng` is an optional injectable random
source (defaults to `Math.random`) so tile-bag operations stay deterministic
in tests.

### `GameState.tileBagRemaining: number` replaced with `GameState.tileBag: RackTile[]`

**Context:** the V0.0 type only stored a count, but the engine needs the
actual remaining tiles to draw from. **Decision:** `GameState` (the
authoritative, server-side representation the engine operates on) now holds
the real tile array; a client-facing count is derived at the DB/view layer
(`games_public.tile_bag_remaining`), never duplicated as a second field on
the type itself, per `MASTER_PRODUCT_BRIEF.md` section 69 ("avoid duplicated
state").

### RLS + masking views: views must do their own row filtering, not rely on RLS running inside them

**Context:** the initial migration draft assumed a `SECURITY DEFINER`-style
view (running with the owner's privileges, so it could read a column like
`rack` the calling role has no grant on) would still have its base table's
`FORCE ROW LEVEL SECURITY` policy enforced during that owner-context query.
This is wrong whenever the view's owner is a superuser (true for the default
`postgres` role migrations run as) — superusers bypass RLS entirely
regardless of `FORCE ROW LEVEL SECURITY`, which would have made
`game_players_public`/`moves_public`/`games_public` leak every row in the
table to every authenticated user (column masking would still have hidden
the opponent's `rack` value itself, but not the row's existence).

**Decision:** every masking view filters its own rows explicitly with
`WHERE EXISTS (... auth.uid() ...)` rather than depending on the base
table's RLS policy being active during the view's execution. The base-table
RLS policies are kept anyway as defense in depth for any future non-owner
access path. See `docs/DATABASE.md` and
`supabase/migrations/00000000000002_v01_schema.sql`.

### Base tables (`games`/`game_players`/`moves`) have zero direct grants to `authenticated`/`anon`

**Decision:** clients can only ever read these three tables through the
masking views above. Granting `SELECT` on the base tables directly — even
with RLS enabled — would let a client bypass the view and read `tile_bag` or
another player's `rack` straight from PostgREST, since RLS only filters
which rows are visible, not which columns.

---

## Downgraded from Expo SDK 57 to SDK 54

**Context:** V0.0 was originally scaffolded with `create-expo-app@latest`,
which resolved Expo SDK 57. When testing on a physical iPhone via Expo Go
from the Apple App Store, the app failed with "Project is incompatible with
this version of Expo Go." Investigation found that as of May 2026, Expo Go is
no longer being updated on the Apple App Store — Apple has a newer submission
(SDK 55) stuck in review with no timeline, so the App Store build is frozen
at **SDK 54**. Expo Go for SDK 55+ is only available via `eas go` + TestFlight
(requires an Apple Developer Program membership) or the iOS Simulator
(requires a Mac, which this project's dev machine does not have).

**Decision:** downgraded `apps/mobile` to Expo SDK 54 (`expo@~54.0.0`, with
`react@19.1.0`, `react-native@0.81.5`, and all other Expo-managed packages
aligned via `npx expo install --fix`) so the app runs on the actual, currently
available Expo Go app from the App Store — no Apple Developer account needed.

**Why:** `MASTER_PRODUCT_BRIEF.md` sections 7-8 explicitly mandate staying on
Expo Go "whenever reasonably possible" for initial distribution. Since Expo
Go's real-world App Store availability is now capped at SDK 54, "latest SDK"
and "Expo Go compatible" are no longer the same thing — SDK 54 is the correct
choice to honor the brief's actual intent.

**Revisit when:** Apple approves a newer Expo Go build on the App Store, or
the project intentionally moves off Expo Go (e.g. via `eas go`/TestFlight or
a development build) for a documented reason per brief section 8.

**Also discovered during this fix:** the initial SDK 57 -> 54 downgrade left
a stale nested `react-native@0.86.2` copy under `expo-status-bar`'s dependency
subtree (an artifact of `npm install`/`expo install --fix` not fully pruning
orphaned nested packages across a major version jump), which broke Jest
module resolution (`Cannot find module 'expo-modules-core'`) despite
`npm ls` reporting a clean tree. Fixed by wiping all `node_modules` and
`package-lock.json` and reinstalling from scratch. **Lesson:** after any
Expo SDK version change, prefer a full clean reinstall over incremental
`npm install`/`npm dedupe` to avoid this class of bug.

---

## V0.0 — Foundation decisions

### Monorepo tooling: npm workspaces

**Context:** needed a way to share `@ordel/*` packages between the Expo app
and future backend code. **Decision:** npm workspaces, not pnpm, not
Turborepo/Nx. **Why:** pnpm's strict symlinked `node_modules` has recurring
friction with Metro's classic Node-style resolution; Turborepo/Nx solve
build-graph caching problems that don't exist yet since every package is
source-only with zero build step. **Revisit if:** package count or CI build
times become a real pain point (rough trigger: V0.3+ once Supabase Edge
Functions and more packages exist).

### Packages are source-only, no build step

**Decision:** `packages/*` point `main`/`types` straight at `src/index.ts`;
Metro and Vitest both transpile TS on the fly. **Why:** eliminates the
"changed the package but the app didn't pick it up" class of bugs entirely —
there's never a `dist/` to go stale.

### Test runner split: Vitest for packages, Jest (`jest-expo`) for the app

**Decision:** pure-TS packages use Vitest; `apps/mobile` uses Jest with the
`jest-expo` preset. **Why:** `jest-expo` correctly mocks React Native/Expo
native modules but is pure overhead for packages with zero RN dependency;
Vitest needs no babel/ts-jest transform configuration and is fast.

### Env vars: Expo's `EXPO_PUBLIC_*` inlining, not `app.config.ts extra`

**Decision:** Supabase URL/anon key flow through `apps/mobile/.env`
(gitignored) via Expo's native `EXPO_PUBLIC_*` build-time inlining. **Why:**
simpler and more current than the older `app.config.ts extra` +
`expo-constants` indirection pattern; one fewer layer to reason about.

### Supabase local dev: CLI + Docker, `app_health` table as connectivity proof

**Decision:** `supabase start` (Docker-backed) for local dev; a single
`app_health` table with RLS enabled and a permissive select policy proves the
full client → Supabase → Postgres → RLS path before any real schema exists.
**Why:** a bare auth ping would under-prove the pipeline; this is a real,
visible, end-to-end check that also establishes RLS-from-day-one as a
convention (`MASTER_PRODUCT_BRIEF.md` section 40) rather than something added
later.

### Navigation: React Navigation v7, one screen, no tabs

**Decision:** `@react-navigation/native` + `native-stack`, a single `Home`
route. **Why:** brief section 23 explicitly forbids exposing empty future
tabs; V0.0 has no Play/Social/Profile content yet, so a tab bar would be pure
decoration. Chose React Navigation v7 (not v6) since v6 is marked
no-longer-supported by its maintainers — no reason to start on a deprecated
major version.

### Docs folder: `docs/` (lowercase), matching the brief's mandated layout

**Context:** the three authoritative docs were briefly in a folder named
`DOCS/`. **Decision:** renamed to lowercase `docs/` per
`MASTER_PRODUCT_BRIEF.md` section 10's repository structure. Safe on
Windows/NTFS (case-insensitive filesystem, so this is a plain rename, not a
folder collision).

### `Tempo` type keeps the exact Swedish preset names as literal values

**Context:** `GAME_RULES.md` section 46 defines turn-duration presets as
`LUGN` / `NORMAL` / `SNABB` / `INGEN GRÄNS` — headers in the rules doc itself,
not just example UI copy. **Decision:** `packages/types`'s `Tempo` type uses
these exact strings as its literal union, rather than inventing English
identifiers (e.g. `RELAXED`/`FAST`). **Why:** treats them as versioned domain
vocabulary (like `SJUA`, which the rules doc also keeps in Swedish rather than
translating to an English bonus name), preserving perfect fidelity to the
authoritative rules document instead of introducing a translation layer that
doesn't appear anywhere in the spec. Brief section 68's "Code: English" rule
is read as applying to identifiers/structure, not to domain terms the rules
document itself has already named.

### Git initialized locally; no remote, no CI, no push

**Decision:** `git init` + local commits are part of V0.0 (needed for the "no
secrets committed" acceptance criterion to mean anything). No GitHub remote
was created and nothing was pushed — that requires the user's explicit
instruction. CI is deferred until a remote exists.

### Auth and the real dictionary are explicitly out of V0.0 scope

**Decision:** V0.0's "Supabase setup" means "reachable and wired up," not a
login flow (auth is `MASTER_PRODUCT_BRIEF.md` section 39 / V0.1 scope). The
dictionary package ships only the `DictionaryProvider` interface plus a tiny,
clearly-labeled dev fixture (`ordel-sv-dev-0.0.0`) — the real `ordel-sv-1.0`
pipeline is gated by `GAME_RULES.md` sections 79-80 and is a dedicated,
separate effort.
