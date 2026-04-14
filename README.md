# Aegis-Dry Web + Backend (Unified Next.js)

This project now uses **Next.js for frontend** and **Supabase Edge Functions for backend APIs**.

- Web frontend (super admin panel)
- Backend APIs via Supabase Edge Function `aegis-api`

## Why this structure

Frontend and backend are split cleanly:

- UI pages: `src/app/**`
- Edge Function backend: `supabase/functions/aegis-api/index.ts`
- Shared frontend logic: `src/lib/**`
- Shared Edge API client: `src/lib/api/edgeClient.js`

## Scripts

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm run start    # Run production server
npm run lint     # ESLint
```

Supabase function commands (Supabase CLI):

```bash
supabase start
supabase functions serve aegis-api --no-verify-jwt
supabase functions deploy aegis-api --no-verify-jwt
```

## Current routes

- Web app: `http://localhost:3000/`
- Edge health: `GET <NEXT_PUBLIC_SUPABASE_FUNCTIONS_BASE_URL>/health`
- Device instructions: `GET <NEXT_PUBLIC_SUPABASE_FUNCTIONS_BASE_URL>/device/instructions?deviceId=...`

## Environment setup

Copy `.env.example` to `.env.local` and configure values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_FUNCTIONS_BASE_URL`
- `OPENWEATHERMAP_API_KEY`
- `OPENWEATHER_DEFAULT_LAT` and `OPENWEATHER_DEFAULT_LON` (optional fallback)

## Environment template file

Use `.env.example` as the source of truth for required local configuration.

1. Duplicate `.env.example` to `.env.local` before running the app.
2. Replace placeholder values in `.env.local` with your own local/project credentials.
3. Keep `.env.example` non-sensitive and commit-safe for new contributors.

Security warning: never commit a real `.env` or `.env.local` file. This repository only tracks `.env.example`.

`GET /device/instructions` supports location via query params:

- `GET <NEXT_PUBLIC_SUPABASE_FUNCTIONS_BASE_URL>/device/instructions?deviceId=<uuid>&lat=<number>&lon=<number>`

If `lat/lon` are not provided, the endpoint falls back to `OPENWEATHER_DEFAULT_LAT` and `OPENWEATHER_DEFAULT_LON`.

## Recommended next integration steps

1. Repoint web/mobile/device clients from `/api/*` to `<NEXT_PUBLIC_SUPABASE_FUNCTIONS_BASE_URL>/*`.
2. Validate admin endpoints with a real `SUPER_ADMIN` JWT.
3. Deploy `aegis-api` to Supabase and smoke-test all routes.
4. Remove `src/app/api/**` once cutover is complete.
