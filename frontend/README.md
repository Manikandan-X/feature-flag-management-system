# Feature Flag & Environment Management System — Frontend

**Signal** — a React frontend for controlling application features without
redeploying code. Provides a dashboard, feature flag management with
environment-scoped configuration, percentage-based rollouts, scheduled
activation, user targeting, an audit log with rollback, analytics, and
role-based admin/employee access.

## Tech Stack

- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **UI:** Material UI (MUI) v7
- **HTTP client:** Axios
- **Routing:** React Router v7
- **Charts:** Chart.js (react-chartjs-2)
- **Linting:** oxlint

---

## Project Structure

```
frontend/
  public/
  src/
    api/          axios client + one module per backend resource
    assets/
    components/   shared UI (layout/nav, cards, chips, states) and
                   feature-specific components (flags, users)
    context/       AuthContext — login/register/me/logout, token refresh
    hooks/
    pages/         one folder per route (auth, dashboard, flags, environments,
                   analytics, audit, users, profile)
    theme/         design tokens + MUI theme
    types/         TypeScript types mirroring backend schemas
    utils/         formatting helpers
    App.tsx        route definitions
    main.tsx       app entry point, providers
  .env.example
  .oxlintrc.json
  index.html
  package.json
  tsconfig.json
  vite.config.ts
```

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- The backend API running (see the backend README)

### 2. Install dependencies

```bash
cd frontend
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Point this at wherever the backend is running.

### 4. Run the development server

```bash
npm run dev
```

The app runs at `http://localhost:5173` by default.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server with hot reload |
| `npm run build` | Type-check and build a production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint the codebase with oxlint |

---

## Authentication & Roles

- New accounts register via the sign-up page and are created as
  **EMPLOYEE** — read-only access to the dashboard, feature flags, and
  environments.
- **ADMIN** accounts additionally get create/edit access on flags and
  environments, rollout percentages, scheduling, user targeting, user
  management, Analytics, and the Audit Log with rollback.
- Access and refresh tokens are stored client-side; an expired access token
  is refreshed automatically and the request retried once before falling
  back to the login screen.

---

## Design System

The interface uses a dark "control room / patch panel" theme, defined in
`src/theme/index.ts`. Each environment (development, testing, production)
has its own accent color, used consistently across chips, charts, and
status indicators. A custom `SignalLamp` component renders on/off state as
a glowing indicator lamp rather than a plain switch, used throughout the
dashboard, flag list, and environment controls.

---

## Building for Production

```bash
npm run build
```

Outputs a static, production-ready bundle to `dist/`, which can be served
by any static file host or reverse proxy in front of the backend API.
