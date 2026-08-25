# Ordel — Roadmap

Full version definitions live in `MASTER_PRODUCT_BRIEF.md` sections 53-64.
This file tracks current status, near-term decisions, and technical debt —
update it as versions complete.

## Current version

**V0.0 — Foundation.** Status: **complete**. All acceptance criteria from
`MASTER_PRODUCT_BRIEF.md` section 53 verified, including running the app in
Expo Go on a physical iPhone with a live local Supabase connection.

## Version overview

| Version | Goal                                                                                       | Status       |
| ------- | ------------------------------------------------------------------------------------------ | ------------ |
| V0.0    | Foundation: repo, Expo app, Supabase wiring, game-engine/dictionary skeletons, tests, docs | **Complete** |
| V0.1    | First complete game: two known users play a full Classic match                             | Not started  |
| V0.2    | Game feel: board interaction, animation, haptics, polish                                   | Not started  |
| V0.3    | Social core: friends, chat, rematch, block/report                                          | Not started  |
| V0.4    | Private beta readiness                                                                     | Not started  |
| V0.5    | Matchmaking + rating                                                                       | Not started  |
| V0.6    | Depth: statistics, replay, saved words                                                     | Not started  |
| V0.7    | Live (real-time timed) mode                                                                | Not started  |
| V0.8    | Daily challenge                                                                            | Not started  |
| V0.9    | Competitive system (ranked/leagues/tournaments) — needs separate detailed planning         | Not started  |
| V1.0    | Public release                                                                             | Not started  |

## Decisions needed before V0.1

These are open product/technical decisions flagged during V0.0 that must be
resolved before V0.1 gameplay work begins (per `MASTER_PRODUCT_BRIEF.md`
section 1's rule: don't silently invent missing rules).

- **Auth method**: email magic link vs. OTP vs. Sign in with Apple first —
  brief section 39 leaves this open pending Expo/Supabase reliability
  research.
- **Real `ordel-sv-1.0` dictionary pipeline**: SALDO import, Sprakradet new
  words, Swedish names (>=100 threshold), Lantmateriet place names, and the
  initial Ordel Extended dataset all need to be built per
  `DICTIONARY_POLICY.md` sections 63-77 before V0.1 can be "gameplay-complete"
  per `GAME_RULES.md` section 80.
- **Full `makeMove()` rule engine**: placement/connectivity/dictionary
  validation/scoring/SJUA — the actual V0.1 core deliverable.
- **Database schema for `profiles`/`games`/`game_players`/`moves`** — design
  per `MASTER_PRODUCT_BRIEF.md` section 41 and document in `DATABASE.md`.

## Technical debt log

- **CI**: none exists yet. Deferred because there's no remote to run it
  against and V0.0's acceptance criteria are entirely local. Add once a
  GitHub remote exists and PRs are part of the workflow.
- **npm audit findings**: `npm install` reports moderate/high vulnerabilities
  from transitive dependencies (mostly dev-time tooling pulled in by Expo's
  own toolchain). Not addressed in V0.0 — revisit before any public release
  (`MASTER_PRODUCT_BRIEF.md` section 63 pre-V1.0 checklist already includes a
  security audit).
