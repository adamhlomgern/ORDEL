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

## Setup

```bash
npm install
cp apps/mobile/.env.example apps/mobile/.env   # fill in Supabase values below
npx supabase start                              # starts local Postgres/Auth/Realtime via Docker
```

`supabase start` prints a local API URL and `anon key` — put those into
`apps/mobile/.env` as `EXPO_PUBLIC_SUPABASE_URL` and
`EXPO_PUBLIC_SUPABASE_ANON_KEY`.

**Testing on a physical phone:** `supabase start` prints `127.0.0.1` as the
API host, but that means "this device" — on your phone that's the phone
itself, not your computer. Replace it in `EXPO_PUBLIC_SUPABASE_URL` with your
computer's LAN IP instead (Windows: `ipconfig`, look for "IPv4 Address";
it's also shown by `expo start` as the `exp://<ip>:8081` address), e.g.
`http://192.168.0.80:54321`. This IP can change when you reconnect to Wi-Fi —
if the backend suddenly becomes unreachable again, check it hasn't changed.

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
