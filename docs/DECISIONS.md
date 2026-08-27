# Ordel — Decisions Log

Long-term-consequence decisions, per `MASTER_PRODUCT_BRIEF.md` section 1: "If
a decision has long-term consequences, document it in DECISIONS.md." Newest
entries at the top.

---

## Switched auth from email OTP to email + password

**Context:** Milestone B chose email OTP specifically to avoid unreliable
magic-link deep-linking into Expo Go — sound reasoning, but it assumed
real, deliverable email addresses. Moving the backend to a hosted Supabase
project (see below) surfaced two compounding problems on top of that:
free-tier hosted Supabase needs a custom SMTP provider before the OTP code
can even be shown in the email (see the entry below), and once Resend was
configured, its sandbox (no verified sending domain) couldn't actually
deliver to made-up test addresses — sign-in failed outright with "Error
sending magic link email." Test accounts need throwaway addresses; real
friends testing the app don't want to wait on an inbox either.

**Decision:** switched to email + password (`signUp` / `signInWithPassword`).
No email is ever sent for either sign-up or sign-in, so this removes the
delivery problem entirely rather than continuing to patch around it —
Resend/SMTP/domain verification are no longer in the login path at all.
This is a partial reversal of the Milestone B decision, recorded here as a
new entry rather than rewriting that one.

**What made this a clean swap:** `AuthProvider`
(`apps/mobile/src/auth/AuthProvider.tsx`) was already written to be
session-agnostic — it resolves status from whatever session exists,
regardless of how it was created — so it needed zero changes.
`enable_confirmations = false` was already pushed to the hosted project
for the OTP flow and happens to be exactly right for password auth too:
`signUp()` returns a usable session immediately, no confirmation email.
`OtpVerifyScreen` was deleted outright (not left dead) along with its
route and test.

**UX:** one `LoginScreen` with an explicit sign-in/sign-up toggle, not
two screens or an auto-detecting single button — Supabase can't safely
tell "wrong password" from "no such account" apart from a single failed
sign-in attempt, so guessing which mode the user meant would be actively
misleading. Sign-up detects Supabase's "already registered" signal (an
empty `identities` array on the returned user, returned instead of an
error — a deliberate anti-enumeration behavior) and tells the user to
switch to sign-in instead of silently doing nothing.

---

## Moved the app's backend from local Docker to a hosted Supabase project

**Context:** local Supabase (Docker) is only reachable on the dev machine's
own LAN — it cannot work for testing with friends on other networks, and
Expo Go's dev-mode Metro server has the same constraint. This isn't a V0.1
requirement (`ROADMAP.md`'s "V0.4 Private beta readiness" is where real
distribution belongs), but the user wanted to try playing with friends now.

**Decision:** created a new, separate hosted Supabase project ("ordel",
`eu-west-1`, ref `kqoqjljlpkktgatgugmk`) — not reusing the account's
existing unrelated project. All 4 migrations and both Edge Functions
(`create-game`, `submit-turn-action`) are deployed there via `supabase db
push` / `supabase functions deploy`. `apps/mobile/.env` now points at the
cloud project's HTTPS URL instead of a LAN IP — this permanently removes
the "find your LAN IP, watch it change on reconnect" friction documented
elsewhere in this file, not just the friends-testing problem.

`supabase functions deploy` bundles the resolved module graph at deploy
time, so it does **not** have the local `supabase/functions/_vendor`
Docker-mount limitation documented below — the vendor workaround is still
required for local `supabase start`/`functions serve`, but deploying to
the cloud would actually work fine even without it. Kept the vendor step
anyway since local dev still needs it and having one Edge Function source
layout for both is simpler than branching.

### Free-tier hosted Supabase blocks custom email templates without SMTP — discovered while wiring this up

**Context:** the local dev email template (`supabase/templates/magic_link.html`)
shows the OTP code directly, which the app's login screen requires (V0.1
Milestone B deliberately chose code-entry over magic links, to avoid
unreliable deep-linking into Expo Go). Pushing that same template to the
hosted project failed: `"Email template modification is not available for
free tier projects using the default email provider."` Testing showed this
wasn't just the template — the **entire** auth config push was rejected as
one unit while the template was included, meaning `otp_length=6` and
`enable_confirmations=false` weren't applying either.

**Decision:** configured Resend as a custom SMTP provider
(`smtp.resend.com`, port 465, user `resend`, password the Resend API key)
— once a real SMTP provider is configured, the "default email provider"
restriction no longer applies and the custom template pushes successfully.
The account has no verified sending domain yet, so it sends from
`onboarding@resend.dev` — **Resend's sandbox likely only delivers to the
Resend account's own verified email until a domain is verified**; a
friend's email may not receive anything until that's set up.

**The SMTP settings are deliberately NOT committed to
`supabase/config.toml`** — they were applied directly to the hosted
project via `RESEND_API_KEY=... supabase config push` and then the local
file was reverted to keep `[auth.email.smtp]` commented out. Local dev
must keep using Mailpit: enabling real SMTP in the shared config.toml would
make every local `supabase start` attempt to send real emails through
Resend instead of capturing them locally (breaking the existing curl/
Mailpit-based verification flow from Milestones B-D), and would fail to
start at all for anyone without `RESEND_API_KEY` set locally. If the
hosted project's SMTP settings ever need to change again, it's a manual
`supabase config push` with the env var set for that one command, not a
checked-in config change.

---

## V0.1 Milestone E — board UI (PLAY + SWAP), completes V0.1

### The client runs the exact same validation/scoring pipeline as the server for live preview

**Context:** the board needs to show the player what word(s) and score a
pending placement would produce before they submit. **Decision:**
`apps/mobile/src/lib/boardPreview.ts`'s `previewPlay()` calls
`checkPlacement` → `extractWords` → `validateWords` → `scoreWords` →
`isSjuaEligible` — the exact same exported, pure functions
`packages/game-engine/src/engine/makeMove.ts`'s `handlePlay()` calls, in
the same order. This is not a reimplementation that could drift from
server truth; it's the real engine, which is safe to import directly into
the RN app because `@ordel/game-engine`/`@ordel/dictionary` have zero
RN-incompatible code (already proven — the Edge Functions import them the
same way). `apps/mobile` gained both as direct dependencies (previously
only `@ordel/shared` was).

### Tap-to-place, not drag-and-drop

**Decision:** select a rack tile (tap), then tap an empty board cell to
place it as "pending"; tap a pending tile again to return it to the rack.
**Why:** no gesture/reanimated library is installed anywhere in this app,
and drag-and-drop would be a meaningfully larger dependency than this
slice needs for a functional first version. Revisit for V0.2 "Game feel"
if drag interaction is wanted for polish.

### Blank tiles: a small modal letter picker, required not optional

**Decision:** `BlankLetterModal` shows the 29 Swedish letters
(`packages/types/src/tiles.ts`'s `Letter` union); selecting one sets
`assignedLetter` before the placement is added to pending state.
**Why required:** `checkPlacement` already rejects a blank placement with
`assignedLetter === null` — a player who draws one of the 2 blank tiles
couldn't play at all without this.

### SWAP shares the rack tray component via a mode toggle, not a separate screen

**Decision:** `BoardScreen`'s `mode: 'play' | 'swap'` switches the same
`RackTray` between "tap to place" and "tap to multi-select for swap,"
disabling board interaction in swap mode. Switching modes clears the
other mode's pending state. **Why:** SWAP needs no board UI at all, so
building a whole separate screen for it would duplicate the rack
rendering/fetch logic `BoardScreen` already has for PLAY.

### `GameDetailScreen` gets one new button, not a bigger screen

**Decision:** "Lägg bricka" (shown only when `canPass` — active + your
turn, the same gate already used for Passa) navigates to the new `Board`
route. Kept `GameDetailScreen` as the "summary" screen and `BoardScreen`
as the "interactive play" screen, rather than merging board rendering into
the existing detail view.

---

## V0.1 Milestone D — Home screen + game creation (no board yet)

### `my_games` extended with the opponent's identity, server-side

**Context:** the Home screen needs to show "vs. \<opponent\>" per game, but
the original `my_games` view (Milestone A) only exposed the caller's own
membership, not the other participant. **Decision:** rather than the app
composing 3 client-side queries per row (`my_games` → `game_players_public`
→ `profiles`), `00000000000004_v01_my_games_opponent.sql` replaces the view
with a self-join against `game_players_public`/`profiles` for "the other
participant." This is unambiguous because Classic games always have
exactly 2 players (`GAME_RULES.md` section 4). Kept the same
self-filtering-on-`auth.uid()` pattern as every other view here.

### A thin wrapper around `functions.invoke()`, not raw calls from screens

**Context:** `functions.invoke()` puts a non-2xx response into `error`, not
`data` — and the actual `{ error: "..." }` body our Edge Functions return
lives on `error.context` (the raw `Response`), not on `error.message`.
**Decision:** `apps/mobile/src/lib/edgeFunctions.ts` is the only place that
knows this shape; `createGame()`/`submitTurnAction()` return a plain
`Result<T> = {ok:true,data} | {ok:false,message}` so screens never touch
`functions.invoke()` directly. Also fixed a related inconsistency
discovered while writing this wrapper: `submit-turn-action`'s 409
(stale-`turn_version`) response used `{error: 'stale_state', message:
'...'}` — a machine code in `error` — while every other error response
here uses `error` as the human-readable message directly. Changed it to
match (`{error: 'Game state changed, please refresh and retry.'}`) rather
than have the wrapper special-case one endpoint.

### `expo-crypto` for `clientMoveId` generation

**Decision:** added `expo-crypto` and use its `randomUUID()` — no
Web-Crypto-style `crypto.randomUUID()` is available in the RN/Hermes
runtime without a native module, and `expo-crypto` is the standard
Expo-managed way to get one, consistent with how every other native
capability in this app is added (`expo-status-bar`,
`@react-native-async-storage/async-storage`, etc.).

### `GameDetailScreen` supports PASS and RESIGN only — not PLAY/SWAP

**Decision:** both are real, valid `GAME_RULES.md` actions that need no
board or rack UI at all, so wiring them up now is genuine value from
already-built (Milestone C) backend work rather than scope creep — two
players can actually finish a game (via passes triggering the
4-scoreless-turn end, or a resignation) before any board exists. PLAY and
SWAP need tile placement/rack rendering and are Milestone E ("board UI").
"Ge upp" shows a native `Alert.alert` confirmation since resigning is
irreversible.

### No tempo picker in `CreateGameScreen`

**Decision:** the Edge Function already defaults to `NORMAL`. Exposing
tempo selection isn't required by any doc for this slice and would add UI
surface with no corresponding turn-timer UI yet to make the choice
meaningful. Revisit once a turn-timer/notification UI exists.

---

## V0.1 Milestone C — Edge Function write path (game creation + move submission)

### Edge Functions cannot import `packages/*` directly in local dev — a vendored copy is required

**Context:** the plan for this slice assumed a Deno import map
(`supabase/functions/deno.json`) could point `@ordel/game-engine` etc.
straight at `../../packages/game-engine/src/index.ts`, keeping the engine a
single source of truth with no vendoring. This failed at worker boot with
`Module not found` — `docker inspect` on the local edge-runtime container
showed Supabase's CLI (`supabase start` and `supabase functions serve`
alike, tested both) bind-mounts **only `supabase/functions/`** into the
container, read-only. A relative import resolving outside that directory
is a real file the container's filesystem simply doesn't have, regardless
of what the import map says. This appears specific to local dev — production
`supabase functions deploy` bundles the resolved module graph rather than
relying on a live filesystem mount — but local dev is exactly what this
slice needed to verify against.

**Decision:** `scripts/sync-edge-functions.mjs` copies
`packages/{types,dictionary,game-engine}/src` into
`supabase/functions/_vendor/` (gitignored, regenerated, never hand-edited),
and `deno.json`'s import map points there instead. Must be re-run after any
change to those three packages, then the local stack restarted if it was
already running (documented in `README.md`). This is a workaround for a
tooling limitation, not a preference — the packages themselves are still
authored and tested in exactly one place.

### The vendored copies need relative imports rewritten with explicit `.ts` extensions

**Context:** `tsconfig.base.json` uses `moduleResolution: "bundler"`, which
lets every file in this repo import a sibling with no extension (`from
'./devWordList'`). Deno's native resolver — used when the edge-runtime
boots a function directly, with no bundler in front of it — requires an
explicit extension on relative specifiers and fails with `Module not
found... Maybe add a '.ts' extension` otherwise. **Decision:**
`sync-edge-functions.mjs` rewrites every relative `from './x'` /
`from '../x'` specifier in the copied files to `from './x.ts'` as part of
the copy step. Cross-package `@ordel/*` specifiers are untouched (those
resolve via the import map, not this rewrite).

### `service_role` needs its own explicit table grants — `BYPASSRLS` is not a table privilege

**Context:** the Edge Functions' own direct PostgREST reads (looking up an
opponent by username, checking for an already-committed idempotent move,
loading current game state) hit `permission denied for table profiles`
even though `service_role` bypasses RLS. **The bug was assuming BYPASSRLS
implies broad table access** — it only skips row-level security _policies_;
the base table-level `SELECT`/`INSERT`/etc. privilege is a separate
Postgres permission that still has to be granted. Migration 2 only granted
`profiles` access to `authenticated`; nothing was ever granted to
`service_role`. **Decision:** `00000000000003_v01_write_path.sql` adds
explicit `select` grants to `service_role` on `profiles`/`games`/
`game_players`/`moves` — only what the Edge Functions' own direct reads
need. The actual writes happen inside `SECURITY DEFINER` functions, which
run with the function owner's privileges regardless of the caller's
grants, so no `insert`/`update` grant to `service_role` was needed.

### `SECURITY DEFINER` on `create_classic_game`/`apply_move_result` is safe here — unlike the Milestone A views bug

**Context:** Milestone A's `docs/DECISIONS.md` entry documents a real bug
where a `SECURITY DEFINER`-style view was reachable by _any_ authenticated
client and had to defend itself with its own row filtering. These two new
Postgres functions are also `SECURITY DEFINER`, which could look like a
repeat of the same mistake. **It isn't:** both functions have
`revoke all ... from public, anon, authenticated` and `grant execute ...
to service_role` — they are reachable **only** from the Edge Functions
(which hold the service-role key), never from a client directly. Running
with elevated privilege is the intended access path here, not a bypass of
one a client could otherwise reach.

### Idempotency is checked before running the engine, not only at the DB layer

**Decision:** `submit-turn-action` queries `moves` for an existing
`(game_id, player_id, client_move_id)` row **before** loading game state or
calling `makeMove()`. A network retry returns the originally-committed
score/words/SJUA bonus directly, never a value recomputed against
possibly-stale state. The `apply_move_result` Postgres function repeats
the same check as a race-safe second layer for two near-simultaneous
retries, and also returns the original stored values in that case — never
a freshly recomputed one. (`GAME_RULES.md` section 62.)

### Optimistic concurrency via `turn_version`, mapped to HTTP 409

**Decision:** the Edge Function reads `games.turn_version` when it loads
state and passes it back as `p_expected_turn_version`. The Postgres
function locks the row (`for update`) and raises Postgres's own
`serialization_failure` code (`40001`) if the version moved since — chosen
because it's a real, pre-existing SQLSTATE for exactly this situation
rather than an invented error code. The Edge Function maps that to HTTP
409 so a client knows to refetch and retry (`GAME_RULES.md` section 72).

### Opponent selection by username; no invite/accept step yet

**Decision:** `create-game` takes `{ opponentUsername, tempo? }` — no
friends list exists yet (that's V0.3), and usernames are already unique
and readable by any authenticated user. Both `game_players` rows are
created with `status = 'accepted'` and the game starts `active`
immediately; `MASTER_PRODUCT_BRIEF.md` section 54 lists "Accept/start if
necessary" as soft, not a hard gate, and no UI for it exists yet. The
schema's `invited`/`accepted` distinction is preserved for a future real
invite flow.

### RNG: Web Crypto (`crypto.getRandomValues`), not `Math.random`

**Decision:** `supabase/functions/_shared/secureRandom.ts` is injected as
the engine's `RandomSource` for the initial shuffle, dealing, and in-game
draws. Deno's edge runtime has Web Crypto natively, so there's no reason
to settle for `Math.random` — `GAME_RULES.md` section 58 asks for "a
sufficiently reliable server-side mechanism."

---

## V0.1 Milestone B — authentication (email OTP) + profile creation

### `@ordel/shared`'s Supabase client stays platform-agnostic; `AsyncStorage` lives only in the app layer

**Context:** persisting a session across app restarts requires a storage
adapter, and React Native's usual choice is
`@react-native-async-storage/async-storage`. But `@ordel/shared` is also
meant for future Deno Edge Functions (`docs/ARCHITECTURE.md`), which cannot
import an RN-only native module. **Decision:** `getSupabaseClient()` gained
an optional `authOptions` parameter (storage adapter, `persistSession`,
`autoRefreshToken`, `detectSessionInUrl`) that defaults to `undefined` —
identical to the old no-args behavior, so existing `@ordel/shared` Vitest
tests are unaffected. Only `apps/mobile/src/lib/supabase.ts` (`getSupabase()`)
actually imports `AsyncStorage` and supplies it.

### `getSupabase()` is a lazy accessor, not an eagerly-constructed client

**Context:** an earlier draft exported `export const supabase = getSupabaseClient(...)`
evaluated at module-import time. This broke the existing Jest smoke test
(`App.test.tsx`) because `getOrdelEnv()` throws synchronously when
`EXPO_PUBLIC_SUPABASE_URL`/`_ANON_KEY` aren't set — true for a bare `jest`
process, since those vars are normally inlined by the Expo CLI, not by
plain Jest. **Decision:** kept `getSupabase()` as a function every call site
invokes (`getSupabase().auth.signInWithOtp(...)`, etc.) so importing the
module never has a side effect. The underlying client returned by
`@ordel/shared`'s `getSupabaseClient()` is still a cached singleton, so this
costs nothing at runtime — it only defers the env-var check to first actual
use. `apps/mobile/jest.setup.js` additionally stubs both env vars for the
test process, since `App.test.tsx` exercises the real client construction
path (unlike the auth screens' own tests, which mock `lib/supabase`
entirely).

### Auth/profile gating lives in one `AuthProvider` context, not per-screen effects

**Decision:** `apps/mobile/src/auth/AuthProvider.tsx` is the single place
that calls `supabase.auth.getSession()` / `onAuthStateChange` and resolves
a `profiles` row lookup, exposing one `status` union
(`loading | signedOut | needsProfile | ready`). `RootNavigator` branches its
screen list on that status (the React Navigation "conditional screens"
pattern) rather than every screen independently deciding whether it should
be visible. **Why:** avoids N copies of the same session-resolution logic
and guarantees a screen never renders in the wrong auth state, including
right after `UsernamePickerScreen` inserts a profile row (handled via an
explicit `refreshProfile()` rather than waiting for an unrelated
`onAuthStateChange` event that inserting a row would never fire).

### Auth method: email OTP, `shouldCreateUser: true`, no separate signup screen

**Decision (reaffirming the earlier choice with the user):** `LoginScreen`
always calls `signInWithOtp({ email, options: { shouldCreateUser: true } })`
— there is no separate "sign up" vs. "log in" branch. **Why:** matches
`profiles`' own design (no signup trigger; a session with no profile row
just means "show the username picker") and Supabase's local
`[auth.email]` config (`enable_confirmations = false`, `otp_length = 6`).

### Username format (3-20 chars, letters/digits/underscore) is a UX default, not a documented rule

**Decision:** `UsernamePickerScreen` validates client-side against
`/^[a-zA-ZåäöÅÄÖ0-9_]{3,20}$/` purely to give fast, friendly feedback. No
doc mandates this exact pattern. **The real guard is server-side:** the
`citext` unique constraint on `profiles.username` (see
`docs/DATABASE.md`) — a Postgres `23505` unique-violation error is caught
and mapped to a Swedish "taken" message. **Revisit when:** the brief
specifies actual username rules (reserved words, profanity filtering,
etc.) — likely alongside the real dictionary/moderation work.

### Dev-convenience sign-out button on `HomeScreen`

**Decision:** added a small "Logga ut" action calling `supabase.auth.signOut()`.
Not requested by any doc — added because repeatedly testing the OTP flow
on-device is impractical without it. Trivial to remove or relocate once a
real settings/profile screen exists.

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
