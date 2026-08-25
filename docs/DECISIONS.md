# Ordel — Decisions Log

Long-term-consequence decisions, per `MASTER_PRODUCT_BRIEF.md` section 1: "If
a decision has long-term consequences, document it in DECISIONS.md." Newest
entries at the top.

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
