# Ordel

A Swedish-first, iOS-first asynchronous social word game. See
[`docs/MASTER_PRODUCT_BRIEF.md`](docs/MASTER_PRODUCT_BRIEF.md) for the full
product/technical brief, [`docs/GAME_RULES.md`](docs/GAME_RULES.md) for
authoritative gameplay rules, and [`docs/ROADMAP.md`](docs/ROADMAP.md) for
current status.

## Prerequisites

- Node 22 (see `.nvmrc`)
- Docker Desktop (for local Supabase)
- An iPhone with the **Expo Go** app (primary way to run this during V0.x)

## Backend: hosted, not local

`apps/mobile/.env` points at a real hosted Supabase project
(`kqoqjljlpkktgatgugmk`, `eu-west-1`), not local Docker — this is what lets
anyone with the app reach the same backend regardless of network, which
local Docker (LAN-only) can't do. See `docs/DECISIONS.md` for why this
changed and its current limitation (Resend sandbox email may only deliver
to the Resend account owner's own address until a sending domain is
verified).

Local Supabase via Docker is still used for **development** — running
migrations/Edge Functions against a disposable local stack before pushing
them to the hosted project. That workflow is unchanged:

```bash
npm install
npm run sync:edge-functions   # required before starting Supabase — see below
npx supabase start            # starts local Postgres/Auth/Realtime/Edge Functions via Docker
```

`npm run sync:edge-functions` copies `packages/{types,dictionary,game-engine}/src`
into `supabase/functions/_vendor/` (gitignored). This is a workaround for a
Supabase CLI limitation, not a design choice — see `docs/DECISIONS.md`.
**Re-run it after any change to those three packages**, then restart
`supabase start` if it was already running.

To push schema/function changes to the hosted project once they're
verified locally:

```bash
npx supabase link --project-ref kqoqjljlpkktgatgugmk
npx supabase db push
npx supabase functions deploy create-game
npx supabase functions deploy submit-turn-action
```

## Run the app

```bash
cd apps/mobile
npm run start
```

Scan the QR code with Expo Go on your iPhone.

## Verify everything works

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
```

## Repository layout

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
