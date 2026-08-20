# Feature Flag & Environment Management System — Backend

A centralized platform for controlling application features without
redeploying code. Supports feature toggles, environment-specific
configuration, percentage-based gradual rollouts, user-specific targeting,
scheduled activation, full audit logging with rollback, and usage analytics.

## Tech Stack

- **Language / Framework:** Python 3.12, FastAPI
- **ORM / Migrations:** SQLAlchemy, Alembic
- **Database:** MySQL 
- **Cache:** Redis
- **Auth:** JWT (access + refresh tokens), bcrypt password hashing
- **Containerization:** Docker, Docker Compose

---

## Project Structure

```
backend/
  alembic/            database migrations
  alembic.ini
  app/
    api/v1/           route handlers (one file per resource)
    core/             settings, security (JWT/bcrypt), RBAC dependencies, middleware
    db/               engine/session setup, seed script
    exceptions/       typed exceptions -> consistent {"success": false, "message": ...} responses
    models/            SQLAlchemy ORM models
    repositories/      database access layer
    schemas/           Pydantic request/response models
    services/          business logic, orchestrates repositories + audit logging
    utils/             Redis client helper
    main.py
  docker-compose.yml
  Dockerfile
  requirements.txt
  .env.example
  SECURITY.md
```

---

## Getting Started (Local Setup)

### 1. Prerequisites

- Python 3.12
- MySQL 8.0
- Redis
- pip / venv

### 2. Clone and enter the project

```bash
cd backend
```

### 3. Create and activate a virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

```env
# Database
DATABASE_URL=mysql+pymysql://<user>:<password>@localhost:3306/<database_name>

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# JWT
JWT_SECRET_KEY=your-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Seed admin account
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=choose-a-strong-password

# App
APP_ENV=development
DEBUG=true
```

### 6. Run database migrations

```bash
alembic upgrade head
```

### 7. Seed initial data (roles + first admin account)

```bash
python -c "from app.db.seed import seed; seed()"
```

This creates the `ADMIN` and `EMPLOYEE` roles and the first admin account
using the credentials from `.env`. Safe to re-run.

### 8. Run the server

```bash
uvicorn app.main:app --reload
```

- API base URL: `http://localhost:8000/api/v1`
- Swagger docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`

---

## Running with Docker

```bash
docker compose up --build -d
```

This starts the API alongside its MySQL and Redis containers as defined in
`docker-compose.yml`. On first run, apply migrations and seed data inside
the running app container:

```bash
docker compose exec app alembic upgrade head
docker compose exec app python -c "from app.db.seed import seed; seed()"
```

Stop the stack with:

```bash
docker compose down
```

---

## Database Migrations (Alembic)

Create a new migration after changing a model:

```bash
alembic revision --autogenerate -m "describe your change"
```

Apply migrations:

```bash
alembic upgrade head
```

Roll back the last migration:

```bash
alembic downgrade -1
```

---

## Authentication & Roles

| Endpoint | Description |
|---|---|
| `POST /api/v1/auth/register` | Public signup — always creates an `EMPLOYEE` account |
| `POST /api/v1/auth/login` | Returns an access + refresh token pair |
| `POST /api/v1/auth/refresh` | Exchanges a refresh token for a new access token |
| `GET /api/v1/auth/me` | Returns the currently authenticated user |
| `POST /api/v1/auth/change-password` | Change your own password |

Two roles are supported:

- **ADMIN** — full access: create/manage feature flags, environments,
  rollouts, schedules, user targeting, user management, audit log +
  rollback, and analytics.
- **EMPLOYEE** — read-only access to dashboards, feature flags, and
  environments.

Include the access token on protected requests:

```
Authorization: Bearer <access_token>
```

---

## Core Feature Areas

- **Feature Flags** — create, update, and configure flags per environment
- **Environments** — manage development / testing / production (or custom)
  environments, each independently enabled per flag
- **Rollouts** — percentage-based gradual rollout per flag + environment
- **Scheduling** — set a start/end window for automatic activation per
  flag + environment
- **User Targeting** — enable or disable a flag for specific users,
  independent of the environment-wide setting
- **User Management** — admin-only: list, create, and update user accounts
  (role, active status)
- **Audit Log** — every create/update/enable/disable/rollout/schedule/
  targeting change is recorded, with one-click rollback for reversible
  actions
- **Analytics** — evaluation counts (enabled vs. disabled) per flag and
  environment
- **Dashboard** — live summary of active/disabled features, environment
  health, and rollout statistics

Full interactive documentation for every endpoint, request/response shape,
and required role is available at `/docs` once the server is running.

---

## Testing

```bash
pytest
```

---

## Security

See [`SECURITY.md`](./SECURITY.md) for the project's security policy and
how to report a vulnerability.
