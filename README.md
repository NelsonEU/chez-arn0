# Chez Arnaud

A menu I made years ago for when we couldn't decide what to eat, now a small website.

Live at [chez.arn0.be](https://chez.arn0.be).

## Stack

- **Backend**: Django + Django REST Framework, Postgres. One app (`content`) covering categories, menu items, and recipes (with nested ingredient groups/ingredients/steps).
- **Frontend**: React + TypeScript, built with Vite. Plain CSS per page/component, no CSS-in-JS. A repository layer (`src/repositories/`) owns all `fetch()` calls and maps API responses to TS models.
- **Admin**: a password-protected `/admin` in the frontend (backed by real Django session auth) for CRUD on categories, menu items, and recipes, drag-and-drop reordering, immediate save per action, recipe draft/publish workflow.
- **Deployment**: Docker Compose on a single VPS. Django serves the built frontend directly (via WhiteNoise) alongside the API, no separate Nginx/static host. Cloudflare Tunnel handles HTTPS and routing to the box.

## Running locally

```bash
cp .env.example .env   # fill in real values, see .env.example for what's needed
docker compose up
```

- Frontend (Vite dev server): [http://localhost:5173](http://localhost:5173)
- Backend directly: [http://localhost:8000](http://localhost:8000)
- Admin: `/admin/login`, password from `.env`'s `ADMIN_PASSWORD`

The dev frontend proxies `/api` and `/media` to the Django container, so the browser only ever talks to `localhost:5173`.

## Tests

Backend only (no frontend test suite, by design):

```bash
cd backend
ADMIN_PASSWORD=test pytest
```

Runs against SQLite (no Postgres needed for tests, see `config/settings.py`'s `DATABASE_URL` fallback). CI runs the same thing on every push to `main` via `.github/workflows/ci.yml`, and only deploys if it passes.

## Deployment

Push to `main`, CI runs the test suite and, on success, SSHs into the VPS to `git pull` and rebuild via `docker-compose.prod.yml`. See `backend/Dockerfile.prod` for the production image (multi-stage: builds the frontend, bakes it into the Django image) and `deploy/backup-db.sh` for the daily Postgres backup (cron'd on the VPS, not run by CI).
