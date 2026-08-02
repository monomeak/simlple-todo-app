# todo-mini-app

A simple full-stack todo application, managed as a pnpm + Turborepo monorepo.

## Structure

```text
todo-mini-app/
├── apps/
│   ├── web/       # Next.js frontend (http://localhost:4000)
│   │   └── Dockerfile
│   └── api/       # Express.js API (http://localhost:3000)
│       └── Dockerfile
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── docker-compose.yml
├── docker-compose.prod.yml
├── .dockerignore
├── .env.example
├── .gitignore
└── README.md
```

- [apps/web](apps/web) — Next.js UI. See [apps/web/README.md](apps/web/README.md).
- [apps/api](apps/api) — Express + TypeORM REST API (auth, tasks, categories). See [apps/api/README.md](apps/api/README.md) for full endpoint/auth docs.

## Prerequisites

- Node.js 20+
- pnpm 10 (`corepack enable` will pick up the version pinned in `package.json`)
- PostgreSQL running locally (or reachable via the `DB_*` env vars)

## Setup

```bash
pnpm install
```

Then create an `.env` in each app from its example file and fill in real values:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

`apps/api/.env` needs your PostgreSQL connection details (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) and a `JWT_SECRET`. `apps/web/.env` points the frontend at the API (`APP_URL`, `API_VERSION`).

## Development

```bash
pnpm dev
```

Runs both apps together through Turborepo:

- API on `http://localhost:3000`
- Web on `http://localhost:4000`

To run just one app:

```bash
pnpm dev:api   # api only  (http://localhost:3000)
pnpm dev:web   # web only  (http://localhost:4000)
```

## Build, Lint, Test

```bash
pnpm build   # turbo run build (builds apps/web with `next build`, apps/api with `tsc`)
pnpm lint    # turbo run lint  (currently lints apps/web)
pnpm test    # turbo run test  (no test scripts wired up yet)
```

Each command fans out through Turborepo to every workspace package that defines the matching script; packages without it are skipped.

## Database

The API uses PostgreSQL via TypeORM. With `TYPEORM_SYNCHRONIZE=true` (the default in `apps/api/.env.example`), the schema is created/updated automatically from the entities in `apps/api/src/entities` — no manual migrations are needed for local development. Just make sure a Postgres database matching `DB_NAME` exists and is reachable with the credentials in `apps/api/.env` before running `pnpm dev`.

See [apps/api/README.md](apps/api/README.md) for entity details, auth flow, and API routes.

## Docker

The whole stack (`web`, `api`, `postgres`) can also be built and run with Docker Compose — no local Node.js or PostgreSQL install required. Each app has its own multi-stage `Dockerfile` (`apps/web/Dockerfile`, `apps/api/Dockerfile`) that uses `turbo prune` to build a minimal image and runs as a non-root user.

> Both Dockerfiles use `turbo prune`, which determines each app's files via `git`. Make sure any changes you want built are at least `git add`-ed (they don't need to be committed).

### Environment variables

Docker Compose reads its variables from a root-level `.env` (separate from `apps/api/.env` / `apps/web/.env`, which are only used for running the apps directly with `pnpm dev`):

```bash
cp .env.example .env
```

Then fill in `.env`:

| Variable | Used by | Notes |
|---|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | postgres, api | api connects using the same credentials |
| `API_PORT` | api | host port published for the API (container always listens on 3000) |
| `JWT_SECRET` | api | required, no default — set a long random value |
| `CORS_ORIGINS` | api | origins allowed to call the API |
| `TYPEORM_SYNCHRONIZE` / `TYPEORM_DROP_SCHEMA` | api | schema auto-sync; see Database section below |
| `WEB_PORT` | web | host port published for the web app (container always listens on 4000) |
| `API_VERSION` | web | API version path segment (`v1`/`v2`) |
| `NEXT_PUBLIC_API_URL` | web | API URL baked into the browser bundle at **build** time — must be reachable from the user's browser (e.g. `http://localhost:3000`), not the internal `api` service name |

No password, secret, or URL is hard-coded in the Dockerfiles or compose files — everything required comes from `.env` (compose fails fast with a clear error if `POSTGRES_PASSWORD` or `JWT_SECRET` is missing).

### Local startup

```bash
docker compose up --build
```

This builds both images and starts `postgres` → `api` → `web` in order, each one waiting for its dependency's healthcheck to pass before starting. Once up:

- Web: http://localhost:4000
- API: http://localhost:3000

Run in the background with `-d`, and stream logs separately:

```bash
docker compose up -d --build
docker compose logs -f            # all services
docker compose logs -f api        # one service
```

### Production deployment

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

`docker-compose.prod.yml` is an overlay on top of the base file — it adds:

- `restart: unless-stopped` on every service
- CPU/memory limits + reservations on every service
- `TYPEORM_SYNCHRONIZE` defaulting to `false` (don't auto-sync schema against a real database — see below)

### Database initialization

- **Local/dev** (`docker-compose.yml` alone): `TYPEORM_SYNCHRONIZE` defaults to `true`, so on first boot the api creates the `users`, `tasks`, `categories`, and `refresh_tokens` tables directly from the TypeORM entities — no migration step needed.
- **Production** (with the prod overlay): synchronize defaults to `false`. Set `TYPEORM_SYNCHRONIZE=true` in `.env` explicitly for the very first deploy against an empty database, then set it back to `false`.
- Postgres data persists in the named volume `postgres_data`, so data survives `docker compose down` / container recreation. To wipe it: `docker compose down -v`.
- The `postgres` service isn't published to the host by default (only reachable by `api` over the internal `todo-network`); to inspect it directly: `docker compose exec postgres psql -U <POSTGRES_USER> -d <POSTGRES_DB>`.

### Health checks

All three services define a `healthcheck` (`pg_isready` for postgres, an HTTP self-check for api/web), and each service's `depends_on` uses `condition: service_healthy` — so `api` won't start until postgres is accepting connections, and `web` won't start until the api responds. Check status with:

```bash
docker compose ps
```

### Shutdown

Both app containers run under Docker/Compose's built-in `init` (tini), so they receive and act on `SIGTERM` immediately instead of waiting out the kill timeout:

```bash
docker compose stop     # graceful shutdown, keeps containers/volumes
docker compose down     # stop and remove containers + network (keeps the postgres_data volume)
docker compose down -v  # also delete the postgres_data volume (destroys all data)
```
