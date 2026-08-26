# Ordel — Roadmap

Full version definitions live in `MASTER_PRODUCT_BRIEF.md` sections 53-64.
This file tracks current status, near-term decisions, and technical debt —
update it as versions complete.

## Current version

**V0.1 — First complete game.** In progress. **Milestone A (game engine +
database schema) complete**: real `makeMove()` rule engine with 75 passing
tests covering placement/word-extraction/dictionary/scoring/SJUA/rack/
turns/end-game, plus the `profiles`/`games`/`game_players`/`moves` schema
with RLS + column-masking views. Not yet built: the Edge Function that wires
the engine to the database, auth screens (OTP), game creation/invite flow,
Home screen, and board UI.

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

## Remaining V0.1 work (after Milestone A)

- **Edge Function write path**: `submit-turn-action` calling `@ordel/game-engine`
  directly, plus a restricted (`service_role`-only) Postgres function that
  atomically persists an already-validated result. See `docs/DECISIONS.md`
  for why the split is designed that way.
- **Auth screens**: OTP entry + first-login username picker (auth method
  already decided — email OTP, not magic links, to avoid Expo Go deep-link
  friction).
- **Game creation/invite flow**: dealing racks, shuffling the bag, picking
  the starting player.
- **Home screen**: YOUR TURN / WAITING, backed by the `my_games` view.
- **Board UI**: tile placement, score preview, submit.

Still explicitly out of V0.1 scope regardless: the real `ordel-sv-1.0`
dictionary pipeline (`DICTIONARY_POLICY.md` sections 63-77, gated separately
per `GAME_RULES.md` section 80 — V0.1 continues using the dev fixture) and
`TIMEOUT` handling (needs a scheduled job, not just client-submitted moves).

## Technical debt log

- **CI**: none exists yet. Deferred because there's no remote to run it
  against and V0.0's acceptance criteria are entirely local. Add once a
  GitHub remote exists and PRs are part of the workflow.
- **npm audit findings**: `npm install` reports moderate/high vulnerabilities
  from transitive dependencies (mostly dev-time tooling pulled in by Expo's
  own toolchain). Not addressed in V0.0 — revisit before any public release
  (`MASTER_PRODUCT_BRIEF.md` section 63 pre-V1.0 checklist already includes a
  security audit).
