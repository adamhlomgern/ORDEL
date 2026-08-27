# Ordel — Roadmap

Full version definitions live in `MASTER_PRODUCT_BRIEF.md` sections 53-64.
This file tracks current status, near-term decisions, and technical debt —
update it as versions complete.

## Current version

**V0.1 — First complete game.** In progress. **Milestone A (game engine +
database schema) complete**: real `makeMove()` rule engine with 75 passing
tests covering placement/word-extraction/dictionary/scoring/SJUA/rack/
turns/end-game, plus the `profiles`/`games`/`game_players`/`moves` schema
with RLS + column-masking views. **Milestone B (auth + profile creation)
complete**: email + password login (switched from the original email-OTP
design — see `docs/DECISIONS.md` — to remove email delivery entirely from
the login path) → first-login username picker, gating navigation via a
single `AuthProvider` status, with session persistence across app
restarts. **Milestone C (Edge Function write path)
complete**: `create-game` and `submit-turn-action` Edge Functions call
`@ordel/game-engine` directly and persist atomically/idempotently through
two restricted Postgres functions — verified end-to-end via curl (real
PLAY/PASS/SWAP/RESIGN moves, duplicate-submission handling, stale-state
rejection). **Milestone D (Home screen + game creation) complete**: a real
Home screen lists games (DIN TUR / VÄNTAR / AVSLUTADE) from the
`my_games` view, a "Nytt parti" flow creates a game by opponent username
via `create-game`, and a game-detail screen shows live state with working
Passa/Ge upp actions via `submit-turn-action`. **Milestone E (board UI)
implementation complete**: tile placement (tap-to-place, blank-letter
picker) and tile swap are both reachable from the app, with a live
client-side score/word preview that runs the actual `@ordel/game-engine`
functions (not a reimplementation). Every `ProposedMove` type is now
reachable from the UI. All automated verification (typecheck/lint/format/
122 tests) is green — **what's left before V0.1 itself is "Complete" in
the table below is a full on-device manual playthrough** (two accounts,
a complete match start to finish), the same checkpoint discipline V0.0
went through before being marked done.

Previous version — **V0.0 — Foundation**: complete. All acceptance criteria
from `MASTER_PRODUCT_BRIEF.md` section 53 verified, including running the
app in Expo Go on a physical iPhone with a live local Supabase connection.

## Version overview

| Version | Goal                                                                                       | Status          |
| ------- | ------------------------------------------------------------------------------------------ | --------------- |
| V0.0    | Foundation: repo, Expo app, Supabase wiring, game-engine/dictionary skeletons, tests, docs | **Complete**    |
| V0.1    | First complete game: two known users play a full Classic match                             | **In progress** |
| V0.2    | Game feel: board interaction, animation, haptics, polish                                   | Not started     |
| V0.3    | Social core: friends, chat, rematch, block/report                                          | Not started     |
| V0.4    | Private beta readiness                                                                     | Not started     |
| V0.5    | Matchmaking + rating                                                                       | Not started     |
| V0.6    | Depth: statistics, replay, saved words                                                     | Not started     |
| V0.7    | Live (real-time timed) mode                                                                | Not started     |
| V0.8    | Daily challenge                                                                            | Not started     |
| V0.9    | Competitive system (ranked/leagues/tournaments) — needs separate detailed planning         | Not started     |
| V1.0    | Public release                                                                             | Not started     |

## Remaining V0.1 work (after Milestones A-E)

- **On-device manual playthrough**: a complete Classic match, start to
  finish, on the physical device — the acceptance bar `MASTER_PRODUCT_BRIEF.md`
  section 53 sets, not yet exercised end-to-end outside automated tests.

Still explicitly out of V0.1 scope regardless: the real `ordel-sv-1.0`
dictionary pipeline (`DICTIONARY_POLICY.md` sections 63-77, gated separately
per `GAME_RULES.md` section 80 — V0.1 continues using the dev fixture) and
`TIMEOUT` handling (needs a scheduled job, not just client-submitted moves).

## Technical debt log

- **Edge Function dependency sync is manual**: `npm run sync:edge-functions`
  must be re-run by hand after changing `packages/{types,dictionary,
game-engine}` (see `docs/DECISIONS.md`). Nothing currently enforces this —
  a stale `supabase/functions/_vendor/` would silently run old engine logic
  locally. Worth a pre-commit hook or CI check once CI exists.
- **CI**: none exists yet. Deferred because there's no remote to run it
  against and V0.0's acceptance criteria are entirely local. Add once a
  GitHub remote exists and PRs are part of the workflow.
- **npm audit findings**: `npm install` reports moderate/high vulnerabilities
  from transitive dependencies (mostly dev-time tooling pulled in by Expo's
  own toolchain). Not addressed in V0.0 — revisit before any public release
  (`MASTER_PRODUCT_BRIEF.md` section 63 pre-V1.0 checklist already includes a
  security audit).
