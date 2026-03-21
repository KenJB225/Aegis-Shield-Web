# Aegis-Dry Web + Backend (Unified Next.js)

This project now uses a single **Next.js** codebase for both:

- Web frontend (super admin panel)
- Backend API routes (device/admin endpoints)

## Why this structure

Frontend and backend live in one folder, so you can deploy and maintain one app:

- UI pages: `src/app/**`
- API routes: `src/app/api/**`
- Shared logic: add in `src/lib/**` (recommended)

## Scripts

```bash
npm run dev      # Start Next.js dev server
npm run build    # Production build
npm run start    # Run production server
npm run lint     # ESLint
```

## Current routes

- Web app: `http://localhost:3000/`
- Health API: `GET /api/health`
- Device instructions API: `GET /api/device/instructions?deviceId=...`

## Recommended next integration steps

1. Add Supabase clients in `src/lib/supabase/` (server and browser clients).
2. Replace mock data in `src/App.jsx` with API calls to `/api/admin/*`.
3. Implement weather + threshold logic in `src/app/api/device/instructions/route.js`.
4. Add auth/role guards for admin-only routes.
