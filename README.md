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
- [src/.npmrc](src/.npmrc) sets `legacy-peer-deps=true`. This is **necessary**, not a lazy workaround: `@vitejs/plugin-react` lists vite `^4–^7` in its peer deps, while `laravel-vite-plugin@^3.1` requires vite `^8`. No single vite version satisfies both at the same time; the ecosystem is mid-transition. The plugins actually work together fine in practice — only the metadata is contradictory. `legacy-peer-deps` makes npm warn instead of erroring. Revisit once `@vitejs/plugin-react` adds vite 8 to its peer-dep range.
