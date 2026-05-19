# webte2-cas-system

Laravel 13 + React 19 + MariaDB stack, fully containerised with Docker Compose.

## Prerequisites

- Docker Desktop (or Docker Engine + Compose)
- Node.js 20+ on the host (only needed for `npm install` / `npm run build`)
    - If you don't want Node on your host, see the "No Node locally?" note below

## Setup

```bash
# 1. clone repo
git clone https://github.com/hoffmennn/webte2-cas-system.git
cd webte2-cas-system

# 2. copy Docker env (controls ports, DB credentials for the containers)
cp .env.example .env

# 3. build the PHP image and install Composer dependencies
docker compose build
docker compose run --rm app composer install

# 4. copy Laravel env (controls the app itself, runs inside the container)
cp src/.env.example src/.env

# 5. start the stack
docker compose up -d

# 6. generate APP_KEY + run migrations
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate

# 7. install + build frontend assets (React + Vite)
cd src
npm install
npm run build
cd ..
```

App is now at http://localhost:8080.

## API keys

Every `/api/*` route requires a valid key in `X-API-Key` (or `Authorization: Bearer …`).

- **The default key lives in `src/.env`** as `CAS_API_KEY=...`. Set this once; the frontend's API-key field accepts the same value.
- **Additional keys** (e.g. one per team member or for demos) can be issued without touching `.env`:

    ```bash
    docker compose exec app php artisan cas:issue-key name-of-person-issued-to
    ```

    The command generates a random 48-character key, stores it in the `api_keys` table with `active=true`, and prints it. Use the printed value as the API key. Revoke with `update active=false` on the row.

## During development

Run the Vite dev server instead of building, so frontend changes hot-reload:

```bash
cd src
npm run dev
```

## No Node locally?

You can run npm in a throwaway container:

```bash
docker run --rm -v "$(pwd)/src:/app" -w /app node:20 sh -c "npm install && npm run build"
```

## Notes

- There are **two** `.env` files on purpose:
    - `./.env` configures Docker Compose itself (host ports, DB credentials it creates).
    - `./src/.env` configures Laravel inside the `app` container. `DB_HOST=db` here refers to the `db` service in `docker-compose.yml`.
- The original Laravel scaffold pinned `@vitejs/plugin-react ^4.3.4`, which only supports Vite ≤ 7 and breaks against Vite 8 (`can't detect preamble` in dev mode). We bumped it to `^6.0.0`, which natively supports Vite 8 + Rolldown. All peer-dep chains now agree — no `legacy-peer-deps` flag needed.
- [resources/views/welcome.blade.php](src/resources/views/welcome.blade.php) uses `@viteReactRefresh` before `@vite(...)`. Required for `npm run dev` (injects the React Fast Refresh preamble); harmless no-op in production builds.
- [vite.config.js](src/vite.config.js) pins `server.host` to `localhost`. Without this, Vite writes `http://[::1]:5173` (IPv6) to `public/hot`, and browsers on Windows often can't connect to it → white page in dev mode.

## Authors & task distribution

| Member                   | Areas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Adam Hoffmann**        | Initial Laravel/React scaffold, OctaveService base, DB schema & migrations, `AnimationStat` model with cooldown logic, `StatsController` + IP geolocation, server-side slowdown, Docker stack, `cas:issue-key` artisan command                                                                                                                                                                                                                                                                                                                                                                                   |
| **Juraj Durmek** (Yur3x) | Boot-fix sweep (peer-deps, env defaults), frontend modular refactor (`main.jsx` → `app/{App,components,hooks,lib}/`), `useApiKey` hook + `/api/ping` live validation, Tailwind migration + responsive layout, mobile burger nav, bilingual UI (EN/SK lang persistence), CSV export (`LogController`), OpenAPI 3.0 spec (EN + SK) + dynamic PDF generation (dompdf) with `Page X/Y` footer, Swagger UI tab, simulation rewrite to `lsim` + pre-compensator tracking (matches `kyvadlo.txt` / `gulicka.txt`), sign-convention adapter, canvas redesign with fulcrum + gradients, JSON error rendering for `/api/*` |

## Installed packages & libraries

### Backend (PHP / Composer)

- `laravel/framework ^13.8`
- `barryvdh/laravel-dompdf ^3.1` — PDF generation for `/docs.pdf`
- `symfony/yaml ^7.4` — parse OpenAPI YAML on the server side
- `laravel/tinker`, `laravel/pail`, `laravel/pint` (dev)

### Frontend (npm)

- `react ^19`, `react-dom ^19`
- `vite ^8`, `@vitejs/plugin-react ^6`, `laravel-vite-plugin`
- `@tailwindcss/vite ^4`, `tailwindcss ^4`
- `swagger-ui-react` — interactive API docs panel

### System (Docker `app` image)

- `php:8.3-fpm` base
- `octave` + GNU Octave packages: `control`, `signal` (installed via `apt` in `docker/php/Dockerfile`)
- Composer 2

### System (`db` image)

- `mariadb:11` (volume-backed)

### System (`nginx` image)

- `nginx:alpine` reverse-proxying to `app:9000` (PHP-FPM)

## Server / configuration changes

- `bootstrap/app.php` — forces JSON rendering for any `/api/*` exception (validation, auth, 500) so the SPA never receives an HTML redirect/error page.
- `routes/web.php` — exposes public docs (`/api/openapi.yaml`, `/docs.pdf`) outside the `api.key` middleware.
- `config/cas.php` — all CAS-specific settings (`CAS_API_KEY`, `CAS_SLOWDOWN_COEFFICIENT`, `CAS_STAT_COOLDOWN_MINUTES`, `CAS_SESSION_DIR`, `CAS_SESSION_TTL_HOURS`, `CAS_EXECUTION_TIMEOUT`).
- `php.ini` (in `docker/php/Dockerfile`) — `max_execution_time = 60` so Octave simulations don't get killed.
- Session token files live at `/tmp/cas_sess_<token>.mat` inside the `app` container (Octave `.mat` workspace persistence between `/api/execute` calls).

## Database

```bash
# Option A — fresh setup from migrations + seeder (default API key gets inserted)
docker compose exec app php artisan migrate --seed
```

`seed.sql` in the repo root contains the same schema + default key as a raw
SQL dump (required by §3 of the assignment). Not needed for normal setup —
`migrate --seed` produces the same result.

The bundled `seed.sql` contains the schema for `api_keys`, `octave_sessions`, `request_logs`, `animation_stats`, plus the default API key from `CAS_API_KEY`.

## Submission status

> Per assignment §3: "v prípade neurobenia niektorej z úloh, to treba jasne vyznačiť."

| Requirement                                                  | Status                     |
| ------------------------------------------------------------ | -------------------------- |
| REQ 1–5 (VCS, bilingual, responsive, REST API, auth)         | ✅ done                    |
| REQ 6 — syntax highlighting in console textarea              | ❌ NOT done                |
| REQ 7–12 (animations, logs, CSV, OpenAPI+PDF, stats, Docker) | ✅ done                    |
| REQ 13 — video                                               | <fill in>                  |
| §3 — seed.sql                                                | ✅ included in repo root   |
| §3 — technical documentation                                 | ✅ this README             |
| §1 — deployed on `nodeXX.webte.fei.stuba.sk`                 | <fill in: URL or NOT done> |
