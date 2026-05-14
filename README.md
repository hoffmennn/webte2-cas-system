
```bash
# 1. clone repo
git clone git@github.com:TVOJ-USERNAME/webte2-cas.git
cd webte2-cas
 
# 2. copy env
cp .env.example .env
 
# 3. build 
docker compose build
docker compose run --rm app composer install
 
# 4. copy Laravel env
cp src/.env.example src/.env
 
# 5. 
docker compose up -d
 
# 6. generate key + migrations
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate
```