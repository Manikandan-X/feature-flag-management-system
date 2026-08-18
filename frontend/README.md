# Signal — Feature Flag & Environment Management (Frontend)

React (Vite) + TypeScript + Material UI frontend for the Feature Flag & Environment
Management System, built directly against the provided FastAPI backend's routes,
schemas, and RBAC.

## Stack
React 19 · Vite · TypeScript · MUI v7 · Axios · React Router v7 · Chart.js (react-chartjs-2)

## Setup

```bash
npm install
cp .env.example .env   # edit VITE_API_BASE_URL if your API isn't on localhost:8000
npm run dev
```

The app expects the backend at `VITE_API_BASE_URL` (default `http://localhost:8000/api/v1`).
CORS must allow this frontend's origin on the FastAPI side.

## Auth & roles

- New accounts register as `EMPLOYEE` (read-only: dashboard, flags, environments).
- `ADMIN` accounts additionally get create/edit on flags & environments, rollout %,
  scheduling, user targeting, Analytics, and Audit Log + rollback.
- Access/refresh tokens are stored in `localStorage`; a 401 triggers a silent
  refresh-and-retry once, then redirects to `/login`.

## Design system

Dark "control room / patch panel" theme (`src/theme/index.ts`) — feature flags are
literally on/off signals routed to environments, so the whole UI borrows that visual
language instead of generic dashboard chrome:

- Each environment gets its own accent color (violet=development, amber=testing,
  coral=production) used consistently in chips, charts, and cards.
- The signature `SignalLamp` component (`src/components/common/SignalLamp.tsx`)
  renders on/off state as a glowing patch-panel indicator lamp instead of a plain
  switch, used on the dashboard, flag list, and environment toggles.
- Space Grotesk for headings, Inter for body text, JetBrains Mono for flag keys,
  IDs, and timestamps.

## Known backend gaps (flagged in-app, not silently hidden)

Three pieces of functionality are write-only because the backend doesn't expose a
GET route for them yet, even though the underlying data/repo methods exist. Each
spot in the UI shows an amber "Backend endpoint needed" notice:

1. **No `/users` list endpoint** — user targeting requires typing a raw user ID
   (Flag detail → Targeting tab).
2. **No GET for user assignments per flag+environment** — `UserAssignmentRepository.get_by_feature_environment()`
   exists but isn't routed. The Targeting tab only shows assignments set during
   the current browser session.
3. **No GET for a flag's schedule** — only `PUT /feature-flags/{id}/environments/{env_id}/schedule`
   exists, so the Schedule tab can set a new window but can't show what's
   currently active. It also requires the environment to already be enabled for
   the flag (the service raises `FeatureScheduleNotFoundException` otherwise).

Adding three small GET routes (reusing existing repository/service methods) would
close all three gaps — happy to write them if you want them in the backend.

## Structure

```
src/
  api/            axios client + one module per backend resource
  components/     layout (shell, nav, route guards) + shared UI (SignalLamp, cards, states)
  context/        AuthContext (login/register/me/logout, token refresh)
  pages/          one folder per route; flags/tabs/ holds the 6 flag-detail tabs
  theme/          design tokens + MUI theme
  types/          TypeScript types mirroring backend Pydantic schemas exactly
  utils/          audit log label/color/formatting helpers
```
